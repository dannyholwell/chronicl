import { startTransition, useEffect, useRef, useState } from 'react';
import {
  BACKGROUND_PRESETS,
  createInitialData,
  DEFAULT_CATEGORIES,
  getLaneColor,
  THEMES,
  TIMELINE_LANES,
} from './presets';

const STORAGE_KEY = 'chronicl-storage-v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_PIXELS_PER_DAY = 0.32;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.4;
const MEMORY_ZONE_HEIGHT = 322;
const BAND_TOP = 332;
const BAND_HEIGHT = 116;
const LANE_START_TOP = 456;
const LANE_HEIGHT = 46;
const LANE_GAP = 2;
const TIMELINE_OFFSET = 172;
const FROZEN_LANE_WIDTH = 132;
const TIMELINE_BOTTOM_PADDING = 20;
const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toDate(value) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T12:00:00`);
}

function daysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate();
}

function parseDateParts(value, fallbackYear = new Date().getFullYear()) {
  const date = toDate(value);

  if (date) {
    return {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
    };
  }

  return {
    year: String(fallbackYear),
    month: '01',
    day: '01',
  };
}

function buildIsoDate({ year, month, day }) {
  return `${year}-${month}-${day}`;
}

function formatDateInputValue(value) {
  const parts = parseDateParts(value);
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function parseTypedDateInput(value, minYear, maxYear) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const segments = normalized.split(/[./-]/).map((segment) => segment.trim());

  if (segments.length !== 3) {
    return null;
  }

  let year;
  let month;
  let day;

  if (segments[0].length === 4) {
    [year, month, day] = segments;
  } else {
    [day, month, year] = segments;
  }

  if (!year || !month || !day) {
    return null;
  }

  const safeYear = Number(year);
  const safeMonth = Number(month);
  const safeDay = Number(day);

  if (
    Number.isNaN(safeYear) ||
    Number.isNaN(safeMonth) ||
    Number.isNaN(safeDay) ||
    safeYear < minYear ||
    safeYear > maxYear ||
    safeMonth < 1 ||
    safeMonth > 12
  ) {
    return null;
  }

  const lastDay = daysInMonth(safeYear, safeMonth);

  if (safeDay < 1 || safeDay > lastDay) {
    return null;
  }

  return buildIsoDate({
    year: String(safeYear),
    month: String(safeMonth).padStart(2, '0'),
    day: String(safeDay).padStart(2, '0'),
  });
}

function formatDate(value) {
  const date = typeof value === 'string' ? toDate(value) : value;

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatShortDate(value) {
  const date = typeof value === 'string' ? toDate(value) : value;

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatMonthYear(value) {
  const date = typeof value === 'string' ? toDate(value) : value;

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1, 12);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31, 12);
}

function addYears(date, years) {
  return new Date(date.getFullYear() + years, date.getMonth(), date.getDate(), 12);
}

function differenceInDays(startDate, endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS);
}

function sortByDate(items) {
  return [...items].sort((left, right) => {
    return toDate(left.date).getTime() - toDate(right.date).getTime();
  });
}

function buildYearSegments(startDate, endDate, pixelsPerDay) {
  const segments = [];

  for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year += 1) {
    const segmentStart = new Date(year, 0, 1, 12);
    const segmentEnd = new Date(year + 1, 0, 1, 12);
    const clampedEnd = segmentEnd > endDate ? endDate : segmentEnd;

    segments.push({
      key: `year-${year}`,
      label: `${year}`,
      left: differenceInDays(startDate, segmentStart) * pixelsPerDay,
      width: Math.max(44, differenceInDays(segmentStart, clampedEnd) * pixelsPerDay),
    });
  }

  return segments;
}

function buildAgeSegments(birthDate, endDate, pixelsPerDay) {
  const segments = [];
  let age = 0;

  while (addYears(birthDate, age) < endDate) {
    const segmentStart = addYears(birthDate, age);
    const segmentEnd = addYears(birthDate, age + 1);
    const clampedEnd = segmentEnd > endDate ? endDate : segmentEnd;

    segments.push({
      key: `age-${age}`,
      label: `Age ${age}`,
      left: differenceInDays(startOfYear(birthDate), segmentStart) * pixelsPerDay,
      width: Math.max(44, differenceInDays(segmentStart, clampedEnd) * pixelsPerDay),
    });

    age += 1;
  }

  return segments;
}

function getCurrentAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return age;
}

function getLatestDate(data, birthDate) {
  const allDates = [birthDate, new Date()];

  data.memories.forEach((memory) => {
    const date = toDate(memory.date);
    if (date) {
      allDates.push(date);
    }
  });

  TIMELINE_LANES.forEach((lane) => {
    data.ranges[lane.id].forEach((range) => {
      const startDate = toDate(range.startDate);
      const endDate = toDate(range.endDate);

      if (startDate) {
        allDates.push(startDate);
      }

      if (endDate) {
        allDates.push(endDate);
      }
    });
  });

  return allDates.reduce((latest, current) => {
    return current > latest ? current : latest;
  }, birthDate);
}

function formatDuration(startValue, endValue) {
  const startDate = toDate(startValue);
  const endDate = toDate(endValue);

  if (!startDate || !endDate) {
    return '';
  }

  const totalMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) +
    (endDate.getDate() >= startDate.getDate() ? 0 : -1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }

  if (parts.length === 0) {
    return 'Less than a month';
  }

  return parts.join(' ');
}

function getFallbackCategory(categories) {
  return categories[0] ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}

function getProfileInitials(name) {
  if (!name?.trim()) {
    return '?';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function hexToRgb(color) {
  const normalized = color?.replace('#', '').trim();

  if (!normalized || (normalized.length !== 3 && normalized.length !== 6)) {
    return null;
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((value) => `${value}${value}`)
          .join('')
      : normalized;

  const integer = Number.parseInt(expanded, 16);

  if (Number.isNaN(integer)) {
    return null;
  }

  return {
    red: (integer >> 16) & 255,
    green: (integer >> 8) & 255,
    blue: integer & 255,
  };
}

function rgbToHex({ red, green, blue }) {
  return `#${[red, green, blue]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixChannel(channel, target, amount) {
  return channel + (target - channel) * amount;
}

function getRelativeContrastColor(color) {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return '#ffffff';
  }

  const luminance = (0.2126 * rgb.red + 0.7152 * rgb.green + 0.0722 * rgb.blue) / 255;
  const target = luminance < 0.47 ? 255 : 16;
  const amount = luminance < 0.47 ? 0.72 : 0.58;

  return rgbToHex({
    red: mixChannel(rgb.red, target, amount),
    green: mixChannel(rgb.green, target, amount),
    blue: mixChannel(rgb.blue, target, amount),
  });
}

function PaintbrushIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M14.2 4.3a2.7 2.7 0 0 1 3.8 0l1.7 1.7a2.7 2.7 0 0 1 0 3.8l-5.6 5.6-5.5-5.5 5.6-5.6Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="m7.9 10.5 5.6 5.6-2 2c-.6.6-1.3 1-2.1 1.2l-2.2.6a2 2 0 0 1-2.5-2.5l.6-2.2c.2-.8.6-1.5 1.2-2.1l1.4-1.4Z"
        fill="currentColor"
      />
      <path
        d="M6.4 17.8c.8.1 1.4.8 1.4 1.6 0 .8-.6 1.5-1.4 1.6h-.6c-1.1 0-2-.9-2-2 0-1 .8-1.9 1.9-2h.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 2.8a.8.8 0 0 1 .8.8v1h8.4v-1a.8.8 0 0 1 1.6 0v1h.8A2.4 2.4 0 0 1 21 7v12.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 19.2V7a2.4 2.4 0 0 1 2.4-2.4h.8v-1A.8.8 0 0 1 7 2.8Z"
        fill="currentColor"
      />
      <path d="M4.6 9.2h14.8v10a.8.8 0 0 1-.8.8H5.4a.8.8 0 0 1-.8-.8v-10Z" fill="#fff" opacity="0.92" />
      <path d="M7.3 12.1h2.2v2H7.3Zm3.6 0h2.2v2h-2.2Zm3.6 0h2.2v2h-2.2Zm-7.2 3.5h2.2v2H7.3Zm3.6 0h2.2v2h-2.2Z" fill="currentColor" opacity="0.72" />
    </svg>
  );
}

function normalizeData(candidate) {
  const initial = createInitialData();
  const categories =
    Array.isArray(candidate?.categories) && candidate.categories.length > 0
      ? candidate.categories.map((category, index) => ({
          id: category.id || `category-${index + 1}`,
          name: category.name || `Category ${index + 1}`,
          color: category.color || DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length].color,
        }))
      : initial.categories;
  const categoryIds = new Set(categories.map((category) => category.id));
  const fallbackCategory = getFallbackCategory(categories);
  const memories = Array.isArray(candidate?.memories)
    ? sortByDate(
        candidate.memories.map((memory, index) => ({
          id: memory.id || `memory-${index + 1}`,
          name: memory.name || 'Untitled moment',
          date: memory.date || candidate.birthDate || '',
          categoryId: categoryIds.has(memory.categoryId)
            ? memory.categoryId
            : fallbackCategory.id,
          details: memory.details || '',
          photoDataUrl: memory.photoDataUrl || '',
          autoCreated: Boolean(memory.autoCreated),
        })),
      )
    : [];
  const ranges = TIMELINE_LANES.reduce((collection, lane) => {
    const laneRanges = Array.isArray(candidate?.ranges?.[lane.id])
      ? candidate.ranges[lane.id]
      : [];

    collection[lane.id] = laneRanges
      .map((range, index) => ({
        id: range.id || `${lane.id}-${index + 1}`,
        laneId: lane.id,
        label: range.label || `${lane.label} chapter`,
        startDate: range.startDate || candidate.birthDate || '',
        endDate: range.endDate || range.startDate || candidate.birthDate || '',
        details: range.details || '',
        color: getLaneColor(lane.id),
      }))
      .sort((left, right) => {
        return toDate(left.startDate).getTime() - toDate(right.startDate).getTime();
      });

    return collection;
  }, {});

  return {
    birthDate: candidate?.birthDate || initial.birthDate,
    profileName: candidate?.profileName || initial.profileName,
    profilePhotoDataUrl: candidate?.profilePhotoDataUrl || initial.profilePhotoDataUrl,
    themeId: THEMES.some((theme) => theme.id === candidate?.themeId)
      ? candidate.themeId
      : initial.themeId,
    backgroundId: BACKGROUND_PRESETS.some(
      (background) => background.id === candidate?.backgroundId,
    )
      ? candidate.backgroundId
      : initial.backgroundId,
    zoom: clamp(Number(candidate?.zoom) || initial.zoom, MIN_ZOOM, MAX_ZOOM),
    categories,
    memories,
    ranges,
  };
}

function loadData() {
  if (typeof window === 'undefined') {
    return createInitialData();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createInitialData();
  }

  try {
    return normalizeData(JSON.parse(saved));
  } catch (error) {
    console.error('Unable to restore Chronicl data', error);
    return createInitialData();
  }
}

function buildBirthMemory(birthDate, categories) {
  const birthCategory =
    categories.find((category) => category.name.toLowerCase() === 'birth') ??
    getFallbackCategory(categories);

  return {
    id: createId('memory'),
    name: 'Born',
    date: birthDate,
    categoryId: birthCategory.id,
    details: 'Your timeline begins here.',
    photoDataUrl: '',
    autoCreated: true,
  };
}

function createEmptyMemory(birthDate, categories, draft) {
  const fallbackCategory = getFallbackCategory(categories);

  return {
    id: draft?.id || createId('memory'),
    name: draft?.name || '',
    date: draft?.date || birthDate || '',
    categoryId: draft?.categoryId || fallbackCategory.id,
    details: draft?.details || '',
    photoDataUrl: draft?.photoDataUrl || '',
    autoCreated: Boolean(draft?.autoCreated),
  };
}

function createEmptyRange(laneId, birthDate, draft) {
  return {
    id: draft?.id || createId('range'),
    laneId: draft?.laneId || laneId,
    label: draft?.label || '',
    startDate: draft?.startDate || birthDate || '',
    endDate: draft?.endDate || birthDate || '',
    details: draft?.details || '',
  };
}

function getSelectedDetail(selectedItem, data, categories) {
  if (!selectedItem) {
    return null;
  }

  if (selectedItem.kind === 'memory') {
    const memory = data.memories.find((entry) => entry.id === selectedItem.id);

    if (!memory) {
      return null;
    }

    return {
      kind: 'memory',
      item: memory,
      category:
        categories.find((category) => category.id === memory.categoryId) ??
        getFallbackCategory(categories),
    };
  }

  const lane = TIMELINE_LANES.find((entry) => entry.id === selectedItem.laneId);
  const range = data.ranges[selectedItem.laneId]?.find((entry) => entry.id === selectedItem.id);

  if (!range || !lane) {
    return null;
  }

  return {
    kind: 'range',
    item: range,
    lane,
  };
}

async function fileToDataUrl(file) {
  const previewDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = reject;
    nextImage.src = previewDataUrl;
  });

  const maxSide = 1440;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.84);
}

function ModalShell({ title, subtitle, onClose, children, layer = 40 }) {
  return (
    <div className="modal-shell" style={{ zIndex: layer }}>
      <button className="modal-shell__backdrop" onClick={onClose} aria-label="Close modal" />
      <div className="modal">
        <div className="modal__header">
          <div>
            <p className="eyebrow">Edit</p>
            <h2>{title}</h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MomentDateField({ value, minYear, maxYear, onChange }) {
  const fallbackYear = clamp(new Date().getFullYear(), minYear, maxYear);
  const initialParts = parseDateParts(value, fallbackYear);
  const [inputValue, setInputValue] = useState(value ? formatDateInputValue(value) : '');
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState('year');
  const [pickerParts, setPickerParts] = useState(initialParts);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setInputValue(value ? formatDateInputValue(value) : '');
    setPickerParts(parseDateParts(value, fallbackYear));
    setInputError('');
  }, [value, fallbackYear]);

  const selectedYear = clamp(Number(pickerParts.year), minYear, maxYear);
  const selectedMonth = clamp(Number(pickerParts.month), 1, 12);
  const selectedDay = clamp(Number(pickerParts.day), 1, daysInMonth(selectedYear, selectedMonth));
  const yearOptions = [];

  for (let year = maxYear; year >= minYear; year -= 1) {
    yearOptions.push(year);
  }

  function commitDate(nextParts) {
    const nextYear = clamp(Number(nextParts.year), minYear, maxYear);
    const nextMonth = clamp(Number(nextParts.month), 1, 12);
    const nextDay = clamp(Number(nextParts.day), 1, daysInMonth(nextYear, nextMonth));
    const nextIso = buildIsoDate({
      year: String(nextYear),
      month: String(nextMonth).padStart(2, '0'),
      day: String(nextDay).padStart(2, '0'),
    });

    setPickerParts({
      year: String(nextYear),
      month: String(nextMonth).padStart(2, '0'),
      day: String(nextDay).padStart(2, '0'),
    });
    setInputValue(formatDateInputValue(nextIso));
    setInputError('');
    onChange(nextIso);
  }

  function handleTextCommit() {
    const parsed = parseTypedDateInput(inputValue, minYear, maxYear);

    if (!parsed) {
      setInputError(`Use DD/MM/YYYY between ${minYear} and ${maxYear}.`);
      onChange('');
      return;
    }

    commitDate(parseDateParts(parsed, fallbackYear));
  }

  function openPicker() {
    const seedValue = parseTypedDateInput(inputValue, minYear, maxYear) || value;
    setPickerParts(parseDateParts(seedValue, fallbackYear));
    setPickerStep('year');
    setPickerOpen(true);
  }

  return (
    <div className="field">
      <div className="field__split">
        <span>Date</span>
        <small className="field__hint">{value ? formatDate(value) : 'Pick a full date'}</small>
      </div>
      <div className="date-entry">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setInputError('');
          }}
          onBlur={handleTextCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleTextCommit();
            }
          }}
          placeholder="DD/MM/YYYY"
          aria-label="Moment date"
        />
        <button type="button" className="date-entry__button" onClick={openPicker} aria-label="Open calendar">
          <CalendarIcon />
        </button>
      </div>
      {inputError ? <p className="field__error">{inputError}</p> : null}
      {isPickerOpen ? (
        <div className="date-picker-shell" style={{ zIndex: 80 }}>
          <button
            type="button"
            className="date-picker-shell__backdrop"
            onClick={() => setPickerOpen(false)}
            aria-label="Close date picker"
          />
          <div className="date-picker-sheet" role="dialog" aria-modal="true" aria-label="Choose a date">
            <div className="date-picker-sheet__header">
              <div>
                <p className="eyebrow">Choose date</p>
                <strong>
                  {pickerStep === 'year'
                    ? 'Select year'
                    : pickerStep === 'month'
                      ? 'Select month'
                      : 'Select day'}
                </strong>
              </div>
              <button type="button" className="icon-button" onClick={() => setPickerOpen(false)}>
                Close
              </button>
            </div>
            <div className="date-picker-sheet__summary">{formatDate(buildIsoDate({
              year: String(selectedYear),
              month: String(selectedMonth).padStart(2, '0'),
              day: String(selectedDay).padStart(2, '0'),
            }))}</div>
            <div className="date-picker-sheet__progress">
              <button
                type="button"
                className={`date-step ${pickerStep === 'year' ? 'is-active' : ''}`}
                onClick={() => setPickerStep('year')}
              >
                Year
              </button>
              <button
                type="button"
                className={`date-step ${pickerStep === 'month' ? 'is-active' : ''}`}
                onClick={() => setPickerStep('month')}
              >
                Month
              </button>
              <button
                type="button"
                className={`date-step ${pickerStep === 'day' ? 'is-active' : ''}`}
                onClick={() => setPickerStep('day')}
              >
                Day
              </button>
            </div>
            {pickerStep === 'year' ? (
              <div className="date-picker-sheet__years">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`date-list-item ${selectedYear === year ? 'is-selected' : ''}`}
                    onClick={() => {
                      setPickerParts((current) => ({ ...current, year: String(year) }));
                      setPickerStep('month');
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            ) : null}
            {pickerStep === 'month' ? (
              <div className="date-picker-sheet__grid">
                {MONTH_OPTIONS.map((month) => (
                  <button
                    key={month.value}
                    type="button"
                    className={`date-list-item ${pickerParts.month === month.value ? 'is-selected' : ''}`}
                    onClick={() => {
                      setPickerParts((current) => ({ ...current, month: month.value }));
                      setPickerStep('day');
                    }}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            ) : null}
            {pickerStep === 'day' ? (
              <div className="date-picker-sheet__days">
                {Array.from(
                  { length: daysInMonth(selectedYear, selectedMonth) },
                  (_, index) => index + 1,
                ).map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`date-day ${selectedDay === day ? 'is-selected' : ''}`}
                    onClick={() =>
                      setPickerParts((current) => ({
                        ...current,
                        day: String(day).padStart(2, '0'),
                      }))
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="date-picker-sheet__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setPickerStep((current) =>
                    current === 'day' ? 'month' : current === 'month' ? 'year' : 'year',
                  )
                }
                disabled={pickerStep === 'year'}
              >
                Back
              </button>
              <div className="date-picker-sheet__actions-group">
                <button type="button" className="secondary-button" onClick={() => setPickerOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    commitDate({
                      year: String(selectedYear),
                      month: String(selectedMonth).padStart(2, '0'),
                      day: String(selectedDay).padStart(2, '0'),
                    });
                    setPickerOpen(false);
                  }}
                >
                  Select date
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MemoryEditorModal({
  draft,
  birthDate,
  categories,
  onClose,
  onSave,
  onManageCategories,
}) {
  const [form, setForm] = useState(createEmptyMemory(birthDate, categories, draft));
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(createEmptyMemory(birthDate, categories, draft));
  }, [draft, birthDate]);

  useEffect(() => {
    if (!categories.some((category) => category.id === form.categoryId)) {
      setForm((current) => ({
        ...current,
        categoryId: getFallbackCategory(categories).id,
      }));
    }
  }, [categories, form.categoryId]);

  const birthYear = birthDate ? toDate(birthDate)?.getFullYear() ?? new Date().getFullYear() : new Date().getFullYear() - 120;
  const selectedYear = toDate(form.date)?.getFullYear() ?? birthYear;
  const maxMomentYear = Math.max(new Date().getFullYear(), selectedYear);
  const minMomentYear = Math.min(birthYear, selectedYear);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsProcessingPhoto(true);
    setError('');

    try {
      const photoDataUrl = await fileToDataUrl(file);
      setForm((current) => ({
        ...current,
        photoDataUrl,
      }));
    } catch (uploadError) {
      console.error(uploadError);
      setError('That image could not be processed. Please try another photo.');
    } finally {
      setIsProcessingPhoto(false);
      event.target.value = '';
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.date || !toDate(form.date)) {
      setError('Please enter a valid date or choose one from the calendar.');
      return;
    }

    if (birthDate && toDate(form.date) < toDate(birthDate)) {
      setError('A moment cannot be earlier than your birth date.');
      return;
    }

    onSave(form);
  }

  return (
    <ModalShell
      title={draft ? 'Edit moment' : 'Add moment'}
      subtitle="Keep a title, date, category, and optional photo together in one moment."
      onClose={onClose}
      layer={50}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="First big trip"
            required
          />
        </label>
        <MomentDateField
          value={form.date}
          minYear={minMomentYear}
          maxYear={maxMomentYear}
          onChange={(nextDate) => setForm((current) => ({ ...current, date: nextDate }))}
        />
        <div className="field">
          <div className="field__split">
            <span>Category</span>
            <button type="button" className="text-button" onClick={onManageCategories}>
              Edit category list
            </button>
          </div>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({ ...current, categoryId: event.target.value }))
            }
          >
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <label className="field">
          <span>Details</span>
          <textarea
            value={form.details}
            onChange={(event) =>
              setForm((current) => ({ ...current, details: event.target.value }))
            }
            rows={4}
            placeholder="Add a few lines so the moment has context when you revisit it later."
          />
        </label>
        <div className="field">
          <span>Photo</span>
          <label className="upload-card">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <span>{isProcessingPhoto ? 'Processing image...' : 'Choose an image'}</span>
            <small>Photos are resized and stored locally in your browser.</small>
          </label>
          {form.photoDataUrl ? (
            <div className="image-preview">
              <img src={form.photoDataUrl} alt={form.name || 'Selected moment'} />
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    photoDataUrl: '',
                  }))
                }
              >
                Remove photo
              </button>
            </div>
          ) : null}
          {error ? <p className="field__error">{error}</p> : null}
        </div>
        <div className="modal__actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save moment
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RangeEditorModal({ draft, birthDate, onClose, onSave }) {
  const [form, setForm] = useState(createEmptyRange(draft?.laneId || 'home', birthDate, draft));

  useEffect(() => {
    setForm(createEmptyRange(draft?.laneId || 'home', birthDate, draft));
  }, [draft, birthDate]);

  function handleSubmit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <ModalShell
      title={draft ? `Edit ${TIMELINE_LANES.find((lane) => lane.id === draft.laneId)?.label}` : 'Add range'}
      subtitle="These lower tracks tell the longer story behind your moments."
      onClose={onClose}
      layer={50}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Lane</span>
          <select
            value={form.laneId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                laneId: event.target.value,
              }))
            }
          >
            {TIMELINE_LANES.map((lane) => (
              <option value={lane.id} key={lane.id}>
                {lane.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Title</span>
          <input
            value={form.label}
            onChange={(event) =>
              setForm((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="Primary school"
            required
          />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>Start date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, startDate: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>End date</span>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, endDate: event.target.value }))
              }
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Details</span>
          <textarea
            value={form.details}
            onChange={(event) =>
              setForm((current) => ({ ...current, details: event.target.value }))
            }
            rows={4}
            placeholder="What defined this chapter?"
          />
        </label>
        <div className="modal__actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save range
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function CategoryManagerModal({ categories, onClose, onSave }) {
  const [draftCategories, setDraftCategories] = useState(categories);

  useEffect(() => {
    setDraftCategories(categories);
  }, [categories]);

  function updateCategory(id, key, value) {
    setDraftCategories((current) =>
      current.map((category) =>
        category.id === id
          ? {
              ...category,
              [key]: value,
            }
          : category,
      ),
    );
  }

  function addCategory() {
    setDraftCategories((current) => [
      ...current,
      {
        id: createId('category'),
        name: `New category ${current.length + 1}`,
        color: '#d58b60',
      },
    ]);
  }

  function removeCategory(id) {
    setDraftCategories((current) => current.filter((category) => category.id !== id));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(
      draftCategories
        .filter((category) => category.name.trim())
        .map((category) => ({
          ...category,
          name: category.name.trim(),
        })),
    );
  }

  return (
    <ModalShell
      title="Manage categories"
      subtitle="Create your own moment palette and tune every category color."
      onClose={onClose}
      layer={60}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="category-editor">
          {draftCategories.map((category) => (
            <div className="category-editor__row" key={category.id}>
              <div
                className="category-editor__color"
                style={{
                  '--category-color': category.color,
                  '--category-brush-color': getRelativeContrastColor(category.color),
                }}
              >
                <input
                  type="color"
                  value={category.color}
                  onChange={(event) => updateCategory(category.id, 'color', event.target.value)}
                  aria-label={`Choose color for ${category.name}`}
                />
                <PaintbrushIcon />
              </div>
              <input
                value={category.name}
                onChange={(event) => updateCategory(category.id, 'name', event.target.value)}
                placeholder="Category name"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => removeCategory(category.id)}
                disabled={draftCategories.length === 1}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="secondary-button" onClick={addCategory}>
          Add category
        </button>
        <div className="modal__actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save categories
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ProfileEditorModal({ draft, storageError, onClose, onSave, onReset }) {
  const [form, setForm] = useState({
    profileName: draft.profileName || '',
    birthDate: draft.birthDate || '',
    profilePhotoDataUrl: draft.profilePhotoDataUrl || '',
  });
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      profileName: draft.profileName || '',
      birthDate: draft.birthDate || '',
      profilePhotoDataUrl: draft.profilePhotoDataUrl || '',
    });
  }, [draft]);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsProcessingPhoto(true);
    setError('');

    try {
      const profilePhotoDataUrl = await fileToDataUrl(file);
      setForm((current) => ({
        ...current,
        profilePhotoDataUrl,
      }));
    } catch (uploadError) {
      console.error(uploadError);
      setError('That image could not be processed. Please try another photo.');
    } finally {
      setIsProcessingPhoto(false);
      event.target.value = '';
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <ModalShell
      title="Edit profile"
      subtitle="Update the profile card with your name, birth date, and a photo."
      onClose={onClose}
      layer={55}
    >
      <form className="editor-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            value={form.profileName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                profileName: event.target.value,
              }))
            }
            placeholder="Your name"
          />
        </label>
        <label className="field">
          <span>Birth date</span>
          <input
            type="date"
            value={form.birthDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                birthDate: event.target.value,
              }))
            }
            required
          />
        </label>
        <div className="field">
          <span>Profile photo</span>
          <label className="upload-card">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <span>{isProcessingPhoto ? 'Processing image...' : 'Choose an image'}</span>
            <small>Stored locally in your browser with the rest of the timeline.</small>
          </label>
          {form.profilePhotoDataUrl ? (
            <div className="image-preview">
              <img src={form.profilePhotoDataUrl} alt={form.profileName || 'Profile'} />
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    profilePhotoDataUrl: '',
                  }))
                }
              >
                Remove photo
              </button>
            </div>
          ) : null}
          {error ? <p className="field__error">{error}</p> : null}
        </div>
        {storageError ? <p className="field__error">{storageError}</p> : null}
        <div className="modal__actions">
          <button type="button" className="ghost-button" onClick={onReset}>
            Reset timeline
          </button>
          <div className="modal__actions-group">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save profile
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function DetailPanel({ detail, onEdit, onDelete }) {
  if (!detail) {
    return (
      <section className="detail-panel">
        <div className="detail-panel__copy">
          <p className="eyebrow">Selected item</p>
          <h3>Pick a moment or chapter</h3>
          <p>
            Click any marker or range on the timeline to reveal its details here. Moments live
            along the top ribbon and long-form life chapters sit in the four lower tracks.
          </p>
        </div>
      </section>
    );
  }

  if (detail.kind === 'memory') {
    return (
      <section className="detail-panel">
        <div className="detail-panel__copy">
          <p className="eyebrow">Moment</p>
          <h3>{detail.item.name}</h3>
          <div className="detail-panel__meta">
            <span>{formatDate(detail.item.date)}</span>
            <span
              className="pill"
              style={{
                '--pill-color': detail.category.color,
              }}
            >
              {detail.category.name}
            </span>
          </div>
          <p>{detail.item.details || 'No extra notes yet.'}</p>
          <div className="detail-panel__actions">
            <button className="secondary-button" onClick={onEdit}>
              Edit moment
            </button>
            {detail.item.autoCreated ? null : (
              <button className="ghost-button" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
        {detail.item.photoDataUrl ? (
          <div className="detail-panel__media">
            <img src={detail.item.photoDataUrl} alt={detail.item.name} />
          </div>
        ) : (
          <div className="detail-panel__placeholder">
            <span>{detail.category.name}</span>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="detail-panel">
      <div className="detail-panel__copy">
        <p className="eyebrow">{detail.lane.label}</p>
        <h3>{detail.item.label}</h3>
        <div className="detail-panel__meta">
          <span>
            {formatMonthYear(detail.item.startDate)} to {formatMonthYear(detail.item.endDate)}
          </span>
          <span>{formatDuration(detail.item.startDate, detail.item.endDate)}</span>
        </div>
        <p>{detail.item.details || detail.lane.description}</p>
        <div className="detail-panel__actions">
          <button className="secondary-button" onClick={onEdit}>
            Edit range
          </button>
          <button className="ghost-button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      <div
        className="detail-panel__placeholder detail-panel__placeholder--lane"
        style={{
          '--lane-color': detail.item.color,
        }}
      >
        <span>{detail.lane.label}</span>
      </div>
    </section>
  );
}

function OnboardingScreen({ onSubmit }) {
  const [profileName, setProfileName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!profileName.trim() || !birthDate) {
      return;
    }

    onSubmit({
      profileName: profileName.trim(),
      birthDate,
    });
  }

  return (
    <main className="startup-screen">
      <div className="startup-screen__card">
        <p className="eyebrow">Chronicl</p>
        <h1>Turn your life into a living timeline.</h1>
        <p>
          Start with your birth date. From there we can place moments above the axis, track life
          chapters below it, and keep everything saved locally on this device.
        </p>
        <form className="startup-screen__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Your name"
              required
            />
          </label>
          <label className="field">
            <span>Birth date</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
            />
          </label>
          <button className="primary-button" type="submit">
            Build my timeline
          </button>
        </form>
      </div>
    </main>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [memoryDraft, setMemoryDraft] = useState(null);
  const [rangeDraft, setRangeDraft] = useState(null);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [isProfileEditorOpen, setProfileEditorOpen] = useState(false);
  const [storageError, setStorageError] = useState('');
  const scrollRef = useRef(null);
  const widthRef = useRef(0);

  const theme = THEMES.find((entry) => entry.id === data.themeId) ?? THEMES[0];
  const background =
    BACKGROUND_PRESETS.find((entry) => entry.id === data.backgroundId) ?? BACKGROUND_PRESETS[0];
  const appRootStyle = {
    ...theme.vars,
    '--wallpaper-image': background.wallpaper,
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError('');
    } catch (error) {
      console.error(error);
      setStorageError(
        'Your browser storage looks full. Large photos may need to be removed before saving more.',
      );
    }
  }, [data]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const detail = getSelectedDetail(selectedItem, data, data.categories);

    if (!detail) {
      setSelectedItem(null);
    }
  }, [selectedItem, data]);

  const birthDate = data.birthDate ? toDate(data.birthDate) : null;
  const latestDate = birthDate ? getLatestDate(data, birthDate) : null;
  const startDate = birthDate ? startOfYear(birthDate) : null;
  const endDate = birthDate && latestDate ? endOfYear(latestDate) : null;
  const pixelsPerDay = BASE_PIXELS_PER_DAY * data.zoom;
  const todayMarkerDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    12,
  );
  const timelineWidth =
    birthDate && startDate && endDate
      ? Math.max(
          2400,
          TIMELINE_OFFSET + differenceInDays(startDate, endDate) * pixelsPerDay + 120,
        )
      : 0;
  const yearSegments =
    birthDate && startDate && endDate ? buildYearSegments(startDate, endDate, pixelsPerDay) : [];
  const ageSegments =
    birthDate && endDate ? buildAgeSegments(birthDate, endDate, pixelsPerDay) : [];
  const memories = sortByDate(data.memories);
  const birthCategory =
    data.categories.find((category) => category.name.toLowerCase() === 'birth') ??
    getFallbackCategory(data.categories);
  const ageNow = birthDate ? getCurrentAge(birthDate) : 0;
  const selectedDetail = getSelectedDetail(selectedItem, data, data.categories);
  const rangeAnimationOrder = Object.fromEntries(
    TIMELINE_LANES.flatMap((lane) => data.ranges[lane.id])
      .sort((left, right) => {
        return toDate(left.startDate).getTime() - toDate(right.startDate).getTime();
      })
      .map((range, index) => [range.id, index]),
  );
  const rangeCount = TIMELINE_LANES.reduce(
    (total, lane) => total + data.ranges[lane.id].length,
    0,
  );
  const laneStackHeight =
    TIMELINE_LANES.length * LANE_HEIGHT + (TIMELINE_LANES.length - 1) * LANE_GAP;
  const timelineCanvasHeight = LANE_START_TOP + laneStackHeight + TIMELINE_BOTTOM_PADDING;

  useEffect(() => {
    if (!birthDate) {
      widthRef.current = 0;
      return;
    }

    const scroller = scrollRef.current;
    if (!scroller) {
      widthRef.current = timelineWidth;
      return;
    }

    if (widthRef.current > 0 && widthRef.current !== timelineWidth) {
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      const ratio = center / widthRef.current;
      scroller.scrollLeft = Math.max(0, ratio * timelineWidth - scroller.clientWidth / 2);
    }

    widthRef.current = timelineWidth;
  }, [birthDate, timelineWidth]);

  if (!data.birthDate) {
    return (
      <div className="app-root" style={appRootStyle}>
        <OnboardingScreen
          onSubmit={({ profileName, birthDate }) =>
            setData((current) => {
              const next = normalizeData({
                ...current,
                profileName,
                birthDate,
                memories:
                  current.memories.length > 0
                    ? current.memories
                    : [buildBirthMemory(birthDate, current.categories)],
              });
              return next;
            })
          }
        />
      </div>
    );
  }

  function positionForDate(value) {
    return differenceInDays(startDate, toDate(value)) * pixelsPerDay;
  }

  function widthForRange(startValue, endValue) {
    return Math.max(28, differenceInDays(toDate(startValue), toDate(endValue)) * pixelsPerDay);
  }

  function openNewMemory() {
    setMemoryDraft(createEmptyMemory(data.birthDate, data.categories));
  }

  function openRangeForLane(laneId) {
    setRangeDraft(createEmptyRange(laneId, data.birthDate));
  }

  function handleMemorySave(memory) {
    setData((current) => {
      const exists = current.memories.some((entry) => entry.id === memory.id);
      const nextMemories = exists
        ? current.memories.map((entry) => (entry.id === memory.id ? memory : entry))
        : [...current.memories, memory];

      return normalizeData({
        ...current,
        memories: nextMemories,
      });
    });

    setSelectedItem({
      kind: 'memory',
      id: memory.id,
    });
    setMemoryDraft(null);
  }

  function handleRangeSave(range) {
    setData((current) => {
      const cleanedRange = {
        id: range.id,
        laneId: range.laneId,
        label: range.label,
        startDate: range.startDate,
        endDate: range.endDate,
        details: range.details,
      };
      const nextRanges = Object.fromEntries(
        TIMELINE_LANES.map((lane) => {
          const withoutCurrent = current.ranges[lane.id].filter((entry) => entry.id !== range.id);

          if (lane.id !== range.laneId) {
            return [lane.id, withoutCurrent];
          }

          const hasExisting = current.ranges[lane.id].some((entry) => entry.id === range.id);

          return [
            lane.id,
            hasExisting
              ? withoutCurrent.concat(cleanedRange)
              : [...withoutCurrent, cleanedRange],
          ];
        }),
      );

      return normalizeData({
        ...current,
        ranges: nextRanges,
      });
    });

    setSelectedItem({
      kind: 'range',
      laneId: range.laneId,
      id: range.id,
    });
    setRangeDraft(null);
  }

  function handleCategoriesSave(categories) {
    const cleanCategories =
      categories.length > 0
        ? categories
        : [
            {
              id: 'memory',
              name: 'Moment',
              color: '#c889e7',
            },
          ];
    const fallbackCategory = cleanCategories.find(
      (category) => category.name.toLowerCase() === 'moment',
    )
      ? cleanCategories.find((category) => category.name.toLowerCase() === 'moment')
      : cleanCategories[0];
    const allowedIds = new Set(cleanCategories.map((category) => category.id));

    setData((current) =>
      normalizeData({
        ...current,
        categories: cleanCategories,
        memories: current.memories.map((memory) => ({
          ...memory,
          categoryId: allowedIds.has(memory.categoryId)
            ? memory.categoryId
            : fallbackCategory.id,
        })),
      }),
    );
    setCategoryManagerOpen(false);
  }

  function handleDeleteSelected() {
    if (!selectedDetail) {
      return;
    }

    if (selectedDetail.kind === 'memory' && selectedDetail.item.autoCreated) {
      return;
    }

    if (!window.confirm('Delete this item from your timeline?')) {
      return;
    }

    if (selectedDetail.kind === 'memory') {
      setData((current) => ({
        ...current,
        memories: current.memories.filter((entry) => entry.id !== selectedDetail.item.id),
      }));
    } else {
      setData((current) => ({
        ...current,
        ranges: {
          ...current.ranges,
          [selectedDetail.item.laneId]: current.ranges[selectedDetail.item.laneId].filter(
            (entry) => entry.id !== selectedDetail.item.id,
          ),
        },
      }));
    }

    setSelectedItem(null);
  }

  function applyProfileChanges(updates) {
    setData((current) => {
      const nextBirthDate = updates.birthDate ?? current.birthDate;
      const nextMemories = current.memories.map((memory) =>
        memory.autoCreated ? { ...memory, date: nextBirthDate } : memory,
      );

      return normalizeData({
        ...current,
        ...updates,
        birthDate: nextBirthDate,
        memories: nextMemories,
      });
    });
  }

  function handleProfileSave(profile) {
    applyProfileChanges(profile);
    setProfileEditorOpen(false);
  }

  function resetTimeline() {
    if (!window.confirm('Reset Chronicl and clear everything stored locally?')) {
      return;
    }

    setSelectedItem(null);
    setMemoryDraft(null);
    setRangeDraft(null);
    setCategoryManagerOpen(false);
    setProfileEditorOpen(false);
    setData(createInitialData());
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="app-root" style={appRootStyle}>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__hero">
            <p className="eyebrow">Life timeline generator</p>
            <h1>
              Chronicl<span className="title-mark__suffix">.io</span>
            </h1>
          </div>
          <article className="panel-section panel-section--compact view-tile">
            <div className="mini-picker">
              <span>Theme</span>
              <div className="mini-picker__row">
                {THEMES.map((preset) => (
                  <button
                    key={preset.id}
                    className={`mini-swatch ${data.themeId === preset.id ? 'is-selected' : ''}`}
                    style={{ background: preset.preview }}
                    aria-label={`Use ${preset.name} theme`}
                    onClick={() =>
                      startTransition(() =>
                        setData((current) => ({
                          ...current,
                          themeId: preset.id,
                        })),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </article>
          <article className="panel-section panel-section--compact view-tile">
            <div className="mini-picker">
              <span>Background</span>
              <div className="mini-picker__row">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`mini-swatch ${data.backgroundId === preset.id ? 'is-selected' : ''}`}
                    style={{ background: preset.preview }}
                    aria-label={`Use ${preset.name} background`}
                    onClick={() =>
                      startTransition(() =>
                        setData((current) => ({
                          ...current,
                          backgroundId: preset.id,
                        })),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </article>
          <div className="stat-card">
            <strong>{memories.length}</strong>
            <span>Moments</span>
          </div>
          <div className="stat-card stat-card--profile">
            <button className="stat-card__edit" onClick={() => setProfileEditorOpen(true)}>
              Edit
            </button>
            <div className="profile-mini">
              <div className="profile-mini__avatar">
                {data.profilePhotoDataUrl ? (
                  <img src={data.profilePhotoDataUrl} alt={data.profileName || 'Profile'} />
                ) : (
                  <span>{getProfileInitials(data.profileName)}</span>
                )}
              </div>
              <div className="profile-mini__content">
                <strong className="profile-mini__name">{data.profileName || 'Add your name'}</strong>
                <div className="profile-mini__meta">
                  <span>{formatDate(data.birthDate)}</span>
                  <span>Age {ageNow}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="timeline-stage">
          <section className="timeline-card">
            <div className="timeline-card__header timeline-card__header--stacked">
              <div className="timeline-card__toolbar">
                <label className="timeline-zoom">
                  <span>Zoom {data.zoom.toFixed(2)}x</span>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step="0.05"
                    value={data.zoom}
                    onChange={(event) =>
                      startTransition(() =>
                        setData((current) => ({
                          ...current,
                          zoom: Number(event.target.value),
                        })),
                      )
                    }
                  />
                </label>
                <button className="primary-button" onClick={openNewMemory}>
                  Add moment
                </button>
              </div>
            </div>

            <div
              className="timeline-frame timeline-frame--wide"
              style={{ minHeight: `${timelineCanvasHeight}px` }}
            >
              <div className="timeline-frame__wash" />
              <div
                className="lane-freeze-column"
                style={{
                  top: `${LANE_START_TOP}px`,
                  width: `${FROZEN_LANE_WIDTH}px`,
                  height: `${laneStackHeight}px`,
                }}
              >
                {TIMELINE_LANES.map((lane, laneIndex) => {
                  const top = laneIndex * (LANE_HEIGHT + LANE_GAP);

                  return (
                    <button
                      key={lane.id}
                      className="timeline-lane__label timeline-lane__label--frozen"
                      style={{
                        top: `${top + 4}px`,
                        height: `${LANE_HEIGHT - 8}px`,
                        '--lane-color': lane.color,
                      }}
                      onClick={() => openRangeForLane(lane.id)}
                    >
                      <strong>{lane.label}</strong>
                    </button>
                  );
                })}
              </div>
              <div
                className="timeline-scroll"
                ref={scrollRef}
                onWheel={(event) => {
                  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                    event.preventDefault();
                    event.currentTarget.scrollLeft += event.deltaY;
                  }
                }}
              >
                <div
                  className="timeline-canvas"
                  style={{
                    width: `${timelineWidth}px`,
                    minHeight: `${timelineCanvasHeight}px`,
                  }}
                >
                  {yearSegments.map((segment, index) => (
                    <div
                      key={segment.key}
                      className={`timeline-grid-line ${
                        index % 5 === 0 ? 'timeline-grid-line--strong' : ''
                      }`}
                      style={{ left: `${TIMELINE_OFFSET + segment.left}px` }}
                    />
                  ))}

                  <div
                    className="today-marker"
                    style={{
                      left: `${
                        TIMELINE_OFFSET +
                        differenceInDays(startDate, todayMarkerDate) * pixelsPerDay
                      }px`,
                    }}
                  >
                    <span>Today</span>
                  </div>

                  <div className="memory-zone" style={{ height: `${MEMORY_ZONE_HEIGHT}px` }}>
                    {memories.map((memory, index) => {
                      const category =
                        data.categories.find((entry) => entry.id === memory.categoryId) ??
                        getFallbackCategory(data.categories);
                      const left = TIMELINE_OFFSET + positionForDate(memory.date);
                      const top = 18 + (index % 4) * 38;

                      return (
                        <button
                          key={memory.id}
                          className={`memory-marker ${
                            selectedItem?.kind === 'memory' && selectedItem.id === memory.id
                              ? 'is-selected'
                              : ''
                          } ${memory.photoDataUrl ? 'has-photo' : 'has-pattern'}`}
                          style={{
                            left: `${left}px`,
                            top: `${top}px`,
                            '--marker-color': category.color,
                            '--marker-depth': `${BAND_TOP - top - 30}px`,
                            '--marker-delay': `${index * 90}ms`,
                          }}
                          onClick={() =>
                            setSelectedItem({
                              kind: 'memory',
                              id: memory.id,
                            })
                          }
                        >
                          <span className="memory-marker__stem" />
                          <span className="memory-marker__pin">
                            <span
                              className="memory-marker__preview"
                              style={
                                memory.photoDataUrl
                                  ? {
                                      backgroundImage: `url(${memory.photoDataUrl})`,
                                    }
                                  : undefined
                              }
                            />
                          </span>
                          <span className="memory-marker__label">
                            <strong>{memory.name}</strong>
                            <small>{formatDate(memory.date)}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="center-band" style={{ top: `${BAND_TOP}px`, height: `${BAND_HEIGHT}px` }}>
                    <div className="center-band__row center-band__row--year">
                      {yearSegments.map((segment, index) => (
                        <div
                          className={`band-segment ${index % 2 === 0 ? 'is-even' : ''}`}
                          key={segment.key}
                          style={{
                            left: `${TIMELINE_OFFSET + segment.left}px`,
                            width: `${segment.width}px`,
                          }}
                        >
                          <strong>{segment.label}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="center-band__row center-band__row--age">
                      {birthDate ? (
                        <div
                          className="center-band__birth-line"
                          style={{
                            left: `${TIMELINE_OFFSET + positionForDate(data.birthDate)}px`,
                            '--birth-line-color': birthCategory.color,
                          }}
                        />
                      ) : null}
                      {ageSegments.map((segment, index) => (
                        <div
                          className={`band-segment ${index % 2 === 0 ? 'is-even' : ''}`}
                          key={segment.key}
                          style={{
                            left: `${TIMELINE_OFFSET + segment.left}px`,
                            width: `${segment.width}px`,
                          }}
                        >
                          <strong>{segment.label}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lane-zone" style={{ top: `${LANE_START_TOP}px` }}>
                    {TIMELINE_LANES.map((lane, laneIndex) => {
                      const top = laneIndex * (LANE_HEIGHT + LANE_GAP);

                      return (
                        <div
                          className="timeline-lane"
                          key={lane.id}
                          style={{
                            top: `${top}px`,
                            height: `${LANE_HEIGHT}px`,
                            '--lane-color': lane.color,
                          }}
                        >
                          <div className="timeline-lane__track" />
                          {data.ranges[lane.id].map((range) => (
                            <button
                              key={range.id}
                              className={`range-block ${
                                selectedItem?.kind === 'range' &&
                                selectedItem.id === range.id &&
                                selectedItem.laneId === range.laneId
                                  ? 'is-selected'
                                  : ''
                              }`}
                              style={{
                                left: `${TIMELINE_OFFSET + positionForDate(range.startDate)}px`,
                                width: `${widthForRange(range.startDate, range.endDate)}px`,
                                background: `color-mix(in srgb, ${range.color} 22%, white)`,
                                '--range-delay': `${(rangeAnimationOrder[range.id] ?? 0) * 90}ms`,
                              }}
                              onClick={() =>
                                setSelectedItem({
                                  kind: 'range',
                                  laneId: range.laneId,
                                  id: range.id,
                                })
                              }
                            >
                              <strong>{range.label}</strong>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <DetailPanel
            detail={selectedDetail}
            onEdit={() => {
              if (!selectedDetail) {
                return;
              }

              if (selectedDetail.kind === 'memory') {
                setMemoryDraft(selectedDetail.item);
                return;
              }

              setRangeDraft(selectedDetail.item);
            }}
            onDelete={handleDeleteSelected}
          />
        </main>
      </div>

      {memoryDraft ? (
        <MemoryEditorModal
          draft={memoryDraft}
          birthDate={data.birthDate}
          categories={data.categories}
          onClose={() => setMemoryDraft(null)}
          onSave={handleMemorySave}
          onManageCategories={() => setCategoryManagerOpen(true)}
        />
      ) : null}

      {rangeDraft ? (
        <RangeEditorModal
          draft={rangeDraft}
          birthDate={data.birthDate}
          onClose={() => setRangeDraft(null)}
          onSave={handleRangeSave}
        />
      ) : null}

      {isCategoryManagerOpen ? (
        <CategoryManagerModal
          categories={data.categories}
          onClose={() => setCategoryManagerOpen(false)}
          onSave={handleCategoriesSave}
        />
      ) : null}

      {isProfileEditorOpen ? (
        <ProfileEditorModal
          draft={data}
          storageError={storageError}
          onClose={() => setProfileEditorOpen(false)}
          onSave={handleProfileSave}
          onReset={resetTimeline}
        />
      ) : null}
    </div>
  );
}
