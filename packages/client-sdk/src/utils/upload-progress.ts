/**
 * Upload Progress Utilities
 * Helper functions for calculating and formatting upload progress
 */

import type { UploadProgressEvent } from '../types/upload';

// =============================================================================
// Progress Calculation
// =============================================================================

/**
 * Calculate upload progress percentage
 * @param loaded - Number of bytes uploaded so far
 * @param total - Total number of bytes to upload
 * @returns Progress percentage (0-100), or 0 if total is 0
 */
export function calculatePercentage(loaded: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((loaded / total) * 100), 100);
}

/**
 * Calculate upload speed in bytes per second
 * @param bytesUploaded - Number of bytes uploaded
 * @param elapsedTimeMs - Elapsed time in milliseconds
 * @returns Upload speed in bytes per second, or 0 if elapsed time is 0
 */
export function calculateSpeed(
  bytesUploaded: number,
  elapsedTimeMs: number
): number {
  if (elapsedTimeMs === 0) return 0;
  return Math.round((bytesUploaded / elapsedTimeMs) * 1000);
}

/**
 * Calculate estimated time remaining in milliseconds
 * @param remainingBytes - Number of bytes remaining to upload
 * @param speedBytesPerSecond - Current upload speed in bytes per second
 * @returns Estimated time remaining in milliseconds, or undefined if speed is 0
 */
export function calculateETA(
  remainingBytes: number,
  speedBytesPerSecond: number
): number | undefined {
  if (speedBytesPerSecond === 0 || remainingBytes <= 0) return undefined;
  return Math.round((remainingBytes / speedBytesPerSecond) * 1000);
}

/**
 * Create a complete upload progress event from raw data
 * @param loaded - Number of bytes uploaded so far
 * @param total - Total number of bytes to upload
 * @param startTime - Upload start time in milliseconds (from Date.now())
 * @returns Complete UploadProgressEvent object
 */
export function createProgressEvent(
  loaded: number,
  total: number,
  startTime: number
): UploadProgressEvent {
  const percentage = calculatePercentage(loaded, total);
  const elapsedTime = Date.now() - startTime;
  const speed = calculateSpeed(loaded, elapsedTime);
  const remainingBytes = total - loaded;
  const estimatedTimeRemaining = calculateETA(remainingBytes, speed);

  return {
    loaded,
    total,
    percentage,
    speed,
    estimatedTimeRemaining,
  };
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format bytes to human-readable string with Norwegian locale
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1,5 MB", "512 KB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // Use Norwegian locale for number formatting
  return `${value.toLocaleString('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${sizes[i]}`;
}

/**
 * Format upload speed to human-readable string
 * @param bytesPerSecond - Upload speed in bytes per second
 * @returns Formatted speed string (e.g., "1,5 MB/s", "512 KB/s")
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond, 1)}/s`;
}

/**
 * Format estimated time remaining to human-readable string
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted time string (e.g., "2 min", "30 sek", "1 time")
 */
export function formatETA(milliseconds: number | undefined): string {
  if (milliseconds === undefined) return '';

  const seconds = Math.floor(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds} sek`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'time' : 'timer'}`;
  }

  return `${hours} ${hours === 1 ? 'time' : 'timer'} ${remainingMinutes} min`;
}

/**
 * Format upload progress to a complete human-readable string
 * @param progress - Upload progress event
 * @returns Formatted progress string (e.g., "1,5 MB av 10 MB (15%) - 2,5 MB/s - 3 sek gjenstår")
 */
export function formatProgress(progress: UploadProgressEvent): string {
  const loaded = formatBytes(progress.loaded, 1);
  const total = formatBytes(progress.total, 1);
  const percentage = progress.percentage;

  let result = `${loaded} av ${total} (${percentage}%)`;

  if (progress.speed !== undefined && progress.speed > 0) {
    result += ` - ${formatSpeed(progress.speed)}`;
  }

  if (progress.estimatedTimeRemaining !== undefined) {
    const eta = formatETA(progress.estimatedTimeRemaining);
    if (eta) {
      result += ` - ${eta} gjenstår`;
    }
  }

  return result;
}

// =============================================================================
// Upload State Management
// =============================================================================

/**
 * Simple upload progress tracker for managing upload state
 * Useful for tracking uploads that don't provide native progress events
 */
export class UploadProgressTracker {
  private startTime: number;
  private lastUpdateTime: number;
  private smoothedSpeed: number;
  private readonly speedSmoothingFactor: number;

  /**
   * Create a new upload progress tracker
   * @param speedSmoothingFactor - Factor for smoothing speed calculations (0-1, default: 0.3)
   */
  constructor(speedSmoothingFactor: number = 0.3) {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.smoothedSpeed = 0;
    this.speedSmoothingFactor = Math.max(0, Math.min(1, speedSmoothingFactor));
  }

  /**
   * Update progress and get the current progress event
   * @param loaded - Number of bytes uploaded so far
   * @param total - Total number of bytes to upload
   * @returns Updated UploadProgressEvent
   */
  update(loaded: number, total: number): UploadProgressEvent {
    const now = Date.now();
    const elapsedTime = now - this.startTime;
    const currentSpeed = calculateSpeed(loaded, elapsedTime);

    // Smooth the speed using exponential moving average
    if (this.smoothedSpeed === 0) {
      this.smoothedSpeed = currentSpeed;
    } else {
      this.smoothedSpeed =
        this.speedSmoothingFactor * currentSpeed +
        (1 - this.speedSmoothingFactor) * this.smoothedSpeed;
    }

    this.lastUpdateTime = now;

    const percentage = calculatePercentage(loaded, total);
    const remainingBytes = total - loaded;
    const estimatedTimeRemaining = calculateETA(
      remainingBytes,
      this.smoothedSpeed
    );

    return {
      loaded,
      total,
      percentage,
      speed: Math.round(this.smoothedSpeed),
      estimatedTimeRemaining,
    };
  }

  /**
   * Reset the tracker for a new upload
   */
  reset(): void {
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    this.smoothedSpeed = 0;
  }

  /**
   * Get the elapsed time since upload started
   * @returns Elapsed time in milliseconds
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }
}
