// Type definitions for hijrah-date
// Adapted from https://github.com/msarhan/hijrah-date

/**
 * Represents adjustment options for Hijri calendar calculations
 */
export interface AdjustmentOptions {
  /** Adjustment value in days */
  days?: number;
  /** Specific month to adjust */
  month?: number;
  /** Specific year to adjust */
  year?: number;
}

/**
 * Enumeration of Hijri months
 */
export enum HijriMonth {
  MUHARRAM = 0,
  SAFAR = 1,
  RABI_AL_AWWAL = 2,
  RABI_AL_THANI = 3,
  JUMADA_AL_AWWAL = 4,
  JUMADA_AL_THANI = 5,
  RAJAB = 6,
  SHABAN = 7,
  RAMADAN = 8,
  SHAWWAL = 9,
  DHU_AL_QIDAH = 10,
  DHU_AL_HIJJAH = 11
}

/**
 * Represents a date in the Hijri calendar
 */
export class HijrahDate {
  private _year: number;
  private _month: number;
  private _day: number;
  private static _adjustments: AdjustmentOptions[] = [];

  /**
   * Creates a new HijrahDate instance
   * @param year - Hijri year
   * @param month - Hijri month (0-based)
   * @param day - Day of month
   */
  constructor(year: number, month: number, day: number) {
    if (month < 0 || month > 11) {
      throw new Error('Month must be between 0 and 11');
    }
    
    const daysInMonth = HijrahDate.daysInMonth(year, month);
    if (day < 1 || day > daysInMonth) {
      throw new Error(`Day must be between 1 and ${daysInMonth} for month ${month} in year ${year}`);
    }
    
    this._year = year;
    this._month = month;
    this._day = day;
  }

  /**
   * Get the current Hijri date
   * @returns A new HijrahDate representing the current date
   */
  public static now(): HijrahDate {
    return HijrahDate.fromGregorian(new Date());
  }

  /**
   * Convert a Gregorian date to Hijri
   * @param date - JavaScript Date object representing a Gregorian date
   * @returns A new HijrahDate object
   */
  public static fromGregorian(date: Date): HijrahDate {
    const jd = HijrahDate.gregorianToJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return HijrahDate.fromJulianDay(jd);
  }

  /**
   * Convert a Julian day number to a Hijri date
   * @param julianDay - Julian day number
   * @returns A new HijrahDate object
   */
  private static fromJulianDay(julianDay: number): HijrahDate {
    // Debug logging for input
    console.log('Input Julian Day:', julianDay);
    
    const jd = Math.floor(julianDay) + 0.5;
    console.log('Julian Day before adjustment:', julianDay);
    console.log('Julian Day after floor and adjustment:', jd);
    
    // Islamic calendar starts on July 16, 622 CE (Julian)
    const epoch = 1948439.5; // Restored to original epoch value
    console.log('Epoch:', epoch);
    
    // Days since start of calendar
    const days = Math.floor(jd - epoch); // Remove 0.5 to handle day boundary correctly
    console.log('Days since epoch (corrected):', days);
    
    const cycles = Math.floor(days / 10631.0); // 30 years has 10631 days
    const remainingDays = days - cycles * 10631;
    console.log('30-year cycles:', cycles);
    console.log('Remaining days in current cycle:', remainingDays);
    
    // Years
    let year = cycles * 30;
    let dayOfYear = remainingDays;
    console.log('Initial year:', year);
    console.log('Initial day of year:', dayOfYear);
    
    // Standard year length in days for each year in 30-year cycle
    const yearLengths = [354, 354, 355, 354, 354, 355, 354, 355, 354, 354, 355, 354, 354, 355, 354, 354, 355, 354, 355, 354, 354, 355, 354, 354, 355, 354, 354, 355, 354, 355];
    
    // Find the year
    let yearCount = 0;
    for (let i = 0; i < 30 && dayOfYear >= yearLengths[i]; i++) {
      console.log(`Subtracting year ${i + 1} (${yearLengths[i]} days) from ${dayOfYear} days`);
      dayOfYear -= yearLengths[i];
      year++;
      yearCount++;
    }
    console.log('Years counted in cycle:', yearCount);
    console.log('Final year (corrected):', year);
    console.log('Remaining days:', dayOfYear);
    
    // Month lengths
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    if (HijrahDate.isLeapYear(year)) {
      monthLengths[11] = 30; // Last month has 30 days in leap years
      console.log('Leap year detected, last month has 30 days');
    }
    
    // Find the month and day
    let month = 0;
    let monthCount = 0;
    while (month < 12 && dayOfYear >= monthLengths[month]) {
      console.log(`Subtracting month ${month + 1} (${monthLengths[month]} days) from ${dayOfYear} days`);
      dayOfYear -= monthLengths[month];
      month++;
      monthCount++;
    }
    console.log('Months counted:', monthCount);
    
    const day = dayOfYear + 1;
    console.log('Final calculation - Month:', month, 'Day:', day);
    
    return new HijrahDate(year, month, day);
  }

  /**
   * Convert a Hijri date to a Julian day number
   * @param year - Hijri year
   * @param month - Hijri month (0-based)
   * @param day - Day of month
   * @returns Julian day number
   */
  private static julianDayFromHijri(year: number, month: number, day: number): number {
    const adjustment = HijrahDate.getAdjustment(year, month);
    const adjustedDay = adjustment ? day + (adjustment.days || 0) : day;
    
    // Calculate days in prior months of this year
    let daysPrior = 0;
    for (let m = 0; m < month; m++) {
      daysPrior += HijrahDate.daysInMonth(year, m);
    }
    
    // Calculate days in prior years
    const priorYear = year - 1;
    const cycles = Math.floor(priorYear / 30);
    const remainingYears = priorYear % 30;
    
    // Each 30-year cycle has exactly 10631 days
    let totalDays = cycles * 10631;
    
    // Add days for remaining years
    const yearLengths = [354, 354, 355, 354, 354, 355, 354, 355, 354, 354, 355, 354, 354, 355, 354, 354, 355, 354, 355, 354, 354, 355, 354, 354, 355, 354, 354, 355, 354, 355];
    for (let y = 0; y < remainingYears; y++) {
      totalDays += yearLengths[y];
    }
    
    // Add days in current year
    totalDays += daysPrior + adjustedDay;
    
    // Convert to Julian day by adding the epoch
    return totalDays + 1948439;
  }

  /**
   * Convert a Julian day number to a Gregorian date
   * @param julianDay - Julian day number
   * @returns Object containing year, month (1-based), and day
   */
  private static julianDayToGregorian(julianDay: number): { year: number, month: number, day: number } {
    const jd = Math.floor(julianDay) + 0.5;
    const z = Math.floor(jd);
    const f = jd - z;
    
    let a: number;
    if (z < 2299161) {
      a = z;
    } else {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e) + f;
    let month = e - (e > 13.5 ? 13 : 1);
    let year = c - (month > 2.5 ? 4716 : 4715);
    
    if (year <= 0) {
      year--;  // No year zero in Julian calendar
    }
    
    return { year, month, day: Math.floor(day) };
  }

  /**
   * Convert a Gregorian date to a Julian day number
   * @param year - Gregorian year
   * @param month - Gregorian month (1-based)
   * @param day - Day of month
   * @returns Julian day number
   */
  private static gregorianToJulianDay(year: number, month: number, day: number): number {
    if (month < 3) {
      year--;
      month += 12;
    }
    
    const a = Math.floor(year / 100);
    const b = year > 1582 || (year === 1582 && (month > 10 || (month === 10 && day >= 15))) ? 
      2 - a + Math.floor(a / 4) : 0;
    
    return Math.floor(365.25 * (year + 4716)) + 
           Math.floor(30.6001 * (month + 1)) + 
           day + b - 1524.5;
  }

  /**
   * Get the number of days in a specific Hijri month
   * @param year - Hijri year
   * @param month - Hijri month (0-based)
   * @returns Number of days in the month
   */
  public static daysInMonth(year: number, month: number): number {
    // In the Islamic calendar, odd-numbered months have 30 days and even-numbered months have 29 days,
    // with the 12th month (Dhu al-Hijjah) having 30 days in leap years
    const isOddMonth = month % 2 === 0; // Fix: odd-numbered months (0-based index) have 30 days
    const isLeapYear = HijrahDate.isLeapYear(year);
    
    // If it's the 12th month (Dhu al-Hijjah) and a leap year, it has 30 days
    if (month === 11 && isLeapYear) {
      return 30;
    }
    
    // Apply any adjustments
    const baseLength = isOddMonth ? 30 : 29;
    const adjustment = HijrahDate.getAdjustment(year, month);
    
    return adjustment ? baseLength + (adjustment.days || 0) : baseLength;
  }

  /**
   * Check if a Hijri year is a leap year
   * @param year - Hijri year
   * @returns True if it's a leap year, false otherwise
   */
  public static isLeapYear(year: number): boolean {
    // Debug logging
    console.log('Checking leap year for:', year);
    
    // Calculate the position in the 30-year cycle
    // The Islamic calendar started in 622 CE
    // We need to adjust the year to align with the correct cycle
    const yearInCycle = ((year + 2) % 30);
    
    // Debug logging
    console.log('Year in cycle:', yearInCycle);
    
    // When yearInCycle is 0, it's the 30th year in the cycle
    const effectiveYearInCycle = yearInCycle === 0 ? 30 : yearInCycle;
    
    // Debug logging
    console.log('Effective year in cycle:', effectiveYearInCycle);
    
    // These are the leap years in the 30-year cycle
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    
    const isLeap = leapYears.includes(effectiveYearInCycle);
    console.log('Is leap year:', isLeap);
    
    return isLeap;
  }

  /**
   * Register adjustments for specific dates
   * @param adjustments - Array of adjustment objects
   */
  public static registerAdjustments(adjustments: AdjustmentOptions[]): void {
    HijrahDate._adjustments = adjustments || [];
  }

  /**
   * Get adjustment for a specific year and month
   * @param year - Hijri year
   * @param month - Hijri month (0-based)
   * @returns Adjustment object or undefined if no adjustment found
   */
  private static getAdjustment(year: number, month: number): AdjustmentOptions | undefined {
    const adjustment = HijrahDate._adjustments.find(adj => 
      (adj.year === undefined || adj.year === year) && 
      (adj.month === undefined || adj.month === month)
    );
    return adjustment;
}

  /**
   * Convert this Hijri date to a Gregorian Date object
   * @returns JavaScript Date object
   */
  public toGregorian(): Date {
    const jd = HijrahDate.julianDayFromHijri(this._year, this._month, this._day);
    const { year, month, day } = HijrahDate.julianDayToGregorian(jd);
    return new Date(year, month - 1, day);
  }

  /**
   * Format this date as a string
   * @param format - Optional format string
   * @returns Formatted date string
   */
  public format(format?: string): string {
    if (!format) {
      return `${this._year}-${this._month + 1}-${this._day}`;
    }
    
    return format
      .replace(/yyyy/g, this._year.toString().padStart(4, '0'))
      .replace(/yy/g, (this._year % 100).toString().padStart(2, '0'))
      .replace(/MM/g, (this._month + 1).toString().padStart(2, '0'))
      .replace(/M/g, (this._month + 1).toString())
      .replace(/dd/g, this._day.toString().padStart(2, '0'))
      .replace(/d/g, this._day.toString());
  }

  /**
   * Get the Hijri year
   * @returns Hijri year
   */
  public getFullYear(): number {
    return this._year;
  }

  /**
   * Get the Hijri month (0-based)
   * @returns Hijri month
   */
  public getMonth(): number {
    return this._month;
  }

  /**
   * Get the day of the month
   * @returns Day of the month
   */
  public getDate(): number {
    return this._day;
  }

  /**
   * Get the day of the week (0 = Sunday, 6 = Saturday)
   * @returns Day of the week
   */
  public getDay(): number {
    return this.toGregorian().getDay();
  }

  /**
   * Add days to this date
   * @param days - Number of days to add
   * @returns A new HijrahDate object
   */
  public plusDays(days: number): HijrahDate {
    const gregorian = this.toGregorian();
    gregorian.setDate(gregorian.getDate() + days);
    return HijrahDate.fromGregorian(gregorian);
  }

  /**
   * Add months to this date
   * @param months - Number of months to add
   * @returns A new HijrahDate object
   */
  public plusMonths(months: number): HijrahDate {
    let year = this._year;
    let month = this._month + months;
    
    // Adjust year based on month overflow
    if (month >= 12) {
      year += Math.floor(month / 12);
      month %= 12;
    } else if (month < 0) {
      const yearsToSubtract = Math.ceil(Math.abs(month) / 12);
      year -= yearsToSubtract;
      month += yearsToSubtract * 12;
    }
    
    // Adjust day if it would exceed the days in the target month
    const daysInTargetMonth = HijrahDate.daysInMonth(year, month);
    const day = Math.min(this._day, daysInTargetMonth);
    
    return new HijrahDate(year, month, day);
  }

  /**
   * Add years to this date
   * @param years - Number of years to add
   * @returns A new HijrahDate object
   */
  public plusYears(years: number): HijrahDate {
    const newYear = this._year + years;
    
    // Adjust day if it would exceed the days in the target month (for leap years)
    const daysInTargetMonth = HijrahDate.daysInMonth(newYear, this._month);
    const day = Math.min(this._day, daysInTargetMonth);
    
    return new HijrahDate(newYear, this._month, day);
  }

  /**
   * Compare this date with another
   * @param other - Another HijrahDate to compare with
   * @returns -1 if this date is earlier, 0 if equal, 1 if later
   */
  public compareTo(other: HijrahDate): number {
    if (this._year !== other._year) {
      return this._year < other._year ? -1 : 1;
    }
    if (this._month !== other._month) {
      return this._month < other._month ? -1 : 1;
    }
    if (this._day !== other._day) {
      return this._day < other._day ? -1 : 1;
    }
    return 0;
  }

  /**
   * Check if this date is equal to another
   * @param other - Another HijrahDate to compare with
   * @returns True if dates are equal, false otherwise
   */
  public equals(other: HijrahDate): boolean {
    return this.compareTo(other) === 0;
  }

  /**
   * Check if this date is before another
   * @param other - Another HijrahDate to compare with
   * @returns True if this date is before the other, false otherwise
   */
  public isBefore(other: HijrahDate): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * Check if this date is after another
   * @param other - Another HijrahDate to compare with
   * @returns True if this date is after the other, false otherwise
   */
  public isAfter(other: HijrahDate): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Convert this date to a string
   * @returns String representation of this date
   */
  public toString(): string {
    return this.format();
  }

  /**
   * Parse a string into a HijrahDate
   * @param dateStr - String in format "yyyy-MM-dd"
   * @returns A new HijrahDate object
   */
  public static parse(dateStr: string): HijrahDate {
    const match = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr);
    if (!match) {
      throw new Error('Invalid date format. Expected yyyy-MM-dd');
    }
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Convert to 0-based month
    const day = parseInt(match[3], 10);
    
    if (month < 0 || month > 11) {
      throw new Error('Month must be between 1 and 12 in the input string');
    }
    
    return new HijrahDate(year, month, day);
}

  /**
   * Get days between two Hijri dates
   * @param start - Start date
   * @param end - End date
   * @returns Number of days between dates
   */
  public static daysBetween(start: HijrahDate, end: HijrahDate): number {
    const startJd = HijrahDate.julianDayFromHijri(start.getFullYear(), start.getMonth(), start.getDate());
    const endJd = HijrahDate.julianDayFromHijri(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.abs(endJd - startJd);
  }

  /**
   * Get the last day of the month for this date
   * @returns A new HijrahDate representing the last day of the month
   */
  public endOfMonth(): HijrahDate {
    return new HijrahDate(this._year, this._month, HijrahDate.daysInMonth(this._year, this._month));
  }

  /**
   * Get the first day of the month for this date
   * @returns A new HijrahDate representing the first day of the month
   */
  public startOfMonth(): HijrahDate {
    return new HijrahDate(this._year, this._month, 1);
  }

  /**
   * Get the name of the month in Arabic
   * @returns Arabic name of the month
   */
  public getMonthName(): string {
    const monthNames = [
      'محرم',
      'صفر',
      'ربيع الأول',
      'ربيع الثاني',
      'جمادى الأولى',
      'جمادى الآخرة',
      'رجب',
      'شعبان',
      'رمضان',
      'شوال',
      'ذو القعدة',
      'ذو الحجة'
    ];
    
    return monthNames[this._month];
  }

  /**
   * Get the name of the month in English
   * @returns English name of the month
   */
  public getMonthNameEn(): string {
    const monthNames = [
      'Muharram',
      'Safar',
      'Rabi\' al-Awwal',
      'Rabi\' al-Thani',
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      'Sha\'ban',
      'Ramadan',
      'Shawwal',
      'Dhu al-Qi\'dah',
      'Dhu al-Hijjah'
    ];
    
    return monthNames[this._month];
  }

  /**
   * Get the name of the day of the week in Arabic
   * @returns Arabic name of the day of the week
   */
  public getDayName(): string {
    const dayNames = [
      'الأحد',
      'الإثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت'
    ];
    
    return dayNames[this.getDay()];
  }

  /**
   * Get the name of the day of the week in English
   * @returns English name of the day of the week
   */
  public getDayNameEn(): string {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    
    return dayNames[this.getDay()];
  }
}

// CommonJS compatibility layer for backward compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HijrahDate;
  module.exports.HijriMonth = HijriMonth;
}

// Default export for ES modules
export default HijrahDate;