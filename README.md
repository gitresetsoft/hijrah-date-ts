# hijrah-date-ts

TypeScript implementation of the [hijrah-date](https://github.com/msarhan/hijrah-date) library with full backward compatibility.

## Installation

```bash
npm install hijrah-date-ts
```

## Usage

```typescript
import HijrahDate, { HijriMonth } from 'hijrah-date-ts';

// Create a new Hijri date
const hijriDate = new HijrahDate(1444, HijriMonth.RAMADAN, 15);

// Convert to Gregorian
const gregorianDate = hijriDate.toGregorian();
console.log(gregorianDate); // JS Date object

// Get today's date in Hijri calendar
const today = HijrahDate.now();
console.log(today.format('yyyy-MM-dd')); // e.g., 1444-09-15

// Format a date
console.log(hijriDate.format('dd/MM/yyyy')); // 15/09/1444

// Parse a date string
const parsedDate = HijrahDate.parse('1444-09-15');

// Add days, months, or years
const nextMonth = hijriDate.plusMonths(1);
const nextYear = hijriDate.plusYears(1);
const tenDaysLater = hijriDate.plusDays(10);

// Compare dates
if (hijriDate.isBefore(nextMonth)) {
  console.log('hijriDate is before nextMonth');
}

// Get month name
console.log(hijriDate.getMonthName()); // رمضان
console.log(hijriDate.getMonthNameEn()); // Ramadan

// Register adjustments (for different calculation methods)
HijrahDate.registerAdjustments([
  { month: 8, days: 1 } // Adjust Ramadan by +1 day
]);
```

## API Reference

### Class: HijrahDate

#### Static Methods

- `now()`: Returns current date as HijrahDate
- `fromGregorian(date: Date)`: Converts Gregorian date to HijrahDate
- `parse(dateStr: string)`: Parses string in format "yyyy-MM-dd" to HijrahDate
- `daysInMonth(year: number, month: number)`: Returns days in specific Hijri month
- `isLeapYear(year: number)`: Checks if year is a Hijri leap year
- `registerAdjustments(adjustments: AdjustmentOptions[])`: Registers custom adjustments
- `daysBetween(start: HijrahDate, end: HijrahDate)`: Calculates days between two dates

#### Instance Methods

- `toGregorian()`: Converts to JavaScript Date object
- `format(format?: string)`: Formats date with optional pattern
- `getFullYear()`: Returns Hijri year
- `getMonth()`: Returns Hijri month (0-based)
- `getDate()`: Returns day of month
- `getDay()`: Returns day of week (0 = Sunday)
- `plusDays(days: number)`: Adds days and returns new date
- `plusMonths(months: number)`: Adds months and returns new date
- `plusYears(years: number)`: Adds years and returns new date
- `compareTo(other: HijrahDate)`: Compares with another date
- `equals(other: HijrahDate)`: Checks if dates are equal
- `isBefore(other: HijrahDate)`: Checks if this date is before other
- `isAfter(other: HijrahDate)`: Checks if this date is after other
- `toString()`: Returns string representation
- `endOfMonth()`: Returns date representing last day of month
- `startOfMonth()`: Returns date representing first day of month
- `getMonthName()`: Returns Arabic name of month
- `getMonthNameEn()`: Returns English name of month
- `getDayName()`: Returns Arabic name of day of week
- `getDayNameEn()`: Returns English name of day of week

### Enum: HijriMonth

Constants for Hijri months (0-based):
- `MUHARRAM`: 0
- `SAFAR`: 1
- `RABI_AL_AWWAL`: 2
- `RABI_AL_THANI`: 3
- `JUMADA_AL_AWWAL`: 4
- `JUMADA_AL_THANI`: 5
- `RAJAB`: 6
- `SHABAN`: 7
- `RAMADAN`: 8
- `SHAWWAL`: 9
- `DHU_AL_QIDAH`: 10
- `DHU_AL_HIJJAH`: 11

### Interface: AdjustmentOptions

- `days?: number`: Days adjustment (positive or negative)
- `month?: number`: Specific month to adjust (0-based)
- `year?: number`: Specific year to adjust  

<!-- > [!IMPORTANT]  
> `npm run test` yields 1 failed test (as of 17th Mar 2025):  
> ![npm run test](https://imgur.com/a/quStasF) -->

> **IMPORTANT:**  
> `npm run test` yields 1 failed test (as of 17th Mar 2025): 

![npm run test](https://i.imgur.com/XTEDl6j.png)
> Any contributions appreciated 🙏🏻🙇🏻

## License

MIT
