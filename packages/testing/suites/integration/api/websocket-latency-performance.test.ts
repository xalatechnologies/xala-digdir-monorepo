/**
 * WebSocket Latency Performance Tests
 * Tests for Real-Time Availability with Conflict Prevention (Phase 7)
 * Verifies <1 second update latency with concurrent clients
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const NUM_CONCURRENT_CLIENTS = 10;
const MAX_LATENCY_MS = 1000; // 1 second requirement

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

interface LatencyMeasurement {
  clientId: number;
  latencyMs: number;
  receivedAt: number;
  eventData: any;
}

/**
 * Creates a WebSocket client and waits for connection
 */
async function createConnectedClient(clientId: number, tenantId: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_URL}/ws/events/${tenantId}`);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`Client ${clientId} connection timeout`));
    }, 5000);

    ws.addEventListener('open', () => {
      clearTimeout(timeout);
      // Send subscription message
      ws.send(JSON.stringify({
        type: 'subscribe',
        tenantId: tenantId,
        events: ['booking', 'listing', 'audit'],
      }));
      resolve(ws);
    });

    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Client ${clientId} connection error`));
    });
  });
}

/**
 * Sets up event listener on WebSocket client to measure latency
 */
function setupLatencyListener(
  ws: WebSocket,
  clientId: number,
  startTime: number,
  eventType: string,
  resolve: (measurement: LatencyMeasurement) => void
): void {
  ws.addEventListener('message', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      // Check if this is the event we're waiting for
      if (data.type === eventType) {
        const receivedAt = Date.now();
        const latencyMs = receivedAt - startTime;

        resolve({
          clientId,
          latencyMs,
          receivedAt,
          eventData: data,
        });
      }
    } catch (error) {
      // Ignore parse errors
    }
  });
}

describe('WebSocket Latency Performance', () => {
  let testListingId: string;
  let testBookingId: string;

  beforeAll(async () => {
    // Create a test listing for performance testing
    const createListingRes = await fetch(`${API_URL}/api/listings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Performance Test Listing',
        description: 'WebSocket latency performance test',
        type: 'space',
        status: 'active',
        pricePerHour: 100,
        currency: 'NOK',
        metadata: {
          bufferTimeMinutes: 0, // No buffer for performance testing
        },
      }),
    });

    if (createListingRes.ok) {
      const data = await createListingRes.json();
      testListingId = data.data?.id;
    } else {
      // Fallback to existing listing
      const listingsRes = await fetch(`${API_URL}/api/listings?limit=1`, { headers });
      const listingsData = await listingsRes.json();
      if (listingsData.data && listingsData.data.length > 0) {
        testListingId = listingsData.data[0].id;
      }
    }
  });

  afterAll(async () => {
    // Clean up test booking
    if (testBookingId) {
      await fetch(`${API_URL}/api/bookings/${testBookingId}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore cleanup errors
      });
    }

    // Clean up test listing
    if (testListingId) {
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore cleanup errors
      });
    }
  });

  describe('Single Booking Event Latency', () => {
    it('should broadcast booking event to single client within 1 second', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Connect WebSocket client
      const client = await createConnectedClient(1, TENANT_ID);

      try {
        // Set up promise to wait for event
        const eventReceivedPromise = new Promise<LatencyMeasurement>((resolve) => {
          const startTime = Date.now();
          setupLatencyListener(client, 1, startTime, 'booking', resolve);
        });

        // Small delay to ensure client is fully connected
        await new Promise(resolve => setTimeout(resolve, 100));

        // Record start time and create booking
        const startTime = Date.now();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 3);
        tomorrow.setHours(10, 0, 0, 0);
        const startBookingTime = tomorrow.toISOString();

        const endDate = new Date(tomorrow);
        endDate.setHours(11, 0, 0, 0);
        const endTime = endDate.toISOString();

        const bookingRes = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            listingId: testListingId,
            startTime: startBookingTime,
            endTime,
            totalPrice: 100,
            notes: 'Latency performance test',
          }),
        });

        expect(bookingRes.status).toBe(201);
        const bookingData = await bookingRes.json();
        testBookingId = bookingData.data?.id;

        // Wait for WebSocket event (with 2 second timeout)
        const measurement = await Promise.race([
          eventReceivedPromise,
          new Promise<LatencyMeasurement>((_, reject) =>
            setTimeout(() => reject(new Error('Event timeout after 2 seconds')), 2000)
          ),
        ]);

        // Verify latency is less than 1 second
        expect(measurement.latencyMs).toBeLessThan(MAX_LATENCY_MS);
        expect(measurement.eventData).toBeDefined();
        expect(measurement.eventData.type).toBe('booking');

        console.log(`✓ Single client latency: ${measurement.latencyMs}ms (< ${MAX_LATENCY_MS}ms)`);
      } finally {
        client.close();
      }
    });
  });

  describe('Concurrent Clients Latency', () => {
    it('should broadcast to 10 concurrent clients within 1 second', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Connect all 10 clients
      console.log(`Connecting ${NUM_CONCURRENT_CLIENTS} WebSocket clients...`);
      const clients: WebSocket[] = [];
      const connectionPromises: Promise<WebSocket>[] = [];

      for (let i = 0; i < NUM_CONCURRENT_CLIENTS; i++) {
        connectionPromises.push(createConnectedClient(i + 1, TENANT_ID));
      }

      try {
        // Wait for all clients to connect
        const connectedClients = await Promise.all(connectionPromises);
        clients.push(...connectedClients);
        console.log(`✓ All ${NUM_CONCURRENT_CLIENTS} clients connected`);

        // Set up event listeners on all clients
        const eventPromises: Promise<LatencyMeasurement>[] = [];

        for (let i = 0; i < clients.length; i++) {
          const promise = new Promise<LatencyMeasurement>((resolve) => {
            const startTime = Date.now();
            setupLatencyListener(clients[i], i + 1, startTime, 'booking', resolve);
          });
          eventPromises.push(promise);
        }

        // Small delay to ensure all clients are fully connected
        await new Promise(resolve => setTimeout(resolve, 200));

        // Record start time and create booking
        const startTime = Date.now();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 4);
        tomorrow.setHours(14, 0, 0, 0);
        const startBookingTime = tomorrow.toISOString();

        const endDate = new Date(tomorrow);
        endDate.setHours(15, 0, 0, 0);
        const endTime = endDate.toISOString();

        console.log('Creating booking to trigger concurrent broadcast...');

        const bookingRes = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            listingId: testListingId,
            startTime: startBookingTime,
            endTime,
            totalPrice: 100,
            notes: 'Concurrent clients latency test',
          }),
        });

        expect(bookingRes.status).toBe(201);
        const bookingData = await bookingRes.json();
        const concurrentTestBookingId = bookingData.data?.id;

        // Wait for all clients to receive the event (with 3 second timeout)
        console.log('Waiting for all clients to receive event...');

        const measurements = await Promise.race([
          Promise.all(eventPromises),
          new Promise<LatencyMeasurement[]>((_, reject) =>
            setTimeout(() => reject(new Error('Some clients did not receive event within 3 seconds')), 3000)
          ),
        ]);

        // Verify all clients received event within 1 second
        console.log('\nLatency measurements:');
        measurements.forEach((measurement) => {
          console.log(`  Client ${measurement.clientId}: ${measurement.latencyMs}ms`);
          expect(measurement.latencyMs).toBeLessThan(MAX_LATENCY_MS);
          expect(measurement.eventData).toBeDefined();
          expect(measurement.eventData.type).toBe('booking');
        });

        // Calculate statistics
        const latencies = measurements.map(m => m.latencyMs);
        const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
        const maxLatency = Math.max(...latencies);
        const minLatency = Math.min(...latencies);

        console.log('\nLatency statistics:');
        console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
        console.log(`  Min: ${minLatency}ms`);
        console.log(`  Max: ${maxLatency}ms`);
        console.log(`  All under ${MAX_LATENCY_MS}ms: ✓`);

        // Verify all clients received the event
        expect(measurements.length).toBe(NUM_CONCURRENT_CLIENTS);
        expect(maxLatency).toBeLessThan(MAX_LATENCY_MS);

        // Clean up test booking
        await fetch(`${API_URL}/api/bookings/${concurrentTestBookingId}`, {
          method: 'DELETE',
          headers,
        }).catch(() => {
          // Ignore cleanup errors
        });
      } finally {
        // Close all clients
        console.log('Closing all client connections...');
        clients.forEach(client => {
          try {
            client.close();
          } catch {
            // Ignore close errors
          }
        });
      }
    });
  });

  describe('Multiple Events Latency', () => {
    it('should maintain low latency across multiple consecutive events', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      const NUM_EVENTS = 5;
      const clients: WebSocket[] = [];

      try {
        // Connect 3 clients
        console.log('Connecting 3 WebSocket clients for sequential event test...');
        for (let i = 0; i < 3; i++) {
          const client = await createConnectedClient(i + 1, TENANT_ID);
          clients.push(client);
        }
        console.log('✓ All clients connected');

        await new Promise(resolve => setTimeout(resolve, 200));

        const allMeasurements: LatencyMeasurement[][] = [];

        // Create multiple bookings and measure latency for each
        for (let eventNum = 0; eventNum < NUM_EVENTS; eventNum++) {
          console.log(`\nEvent ${eventNum + 1}/${NUM_EVENTS}:`);

          // Set up event listeners
          const eventPromises: Promise<LatencyMeasurement>[] = clients.map((client, i) => {
            return new Promise<LatencyMeasurement>((resolve) => {
              const startTime = Date.now();

              // Use a one-time listener for this specific event
              const handler = (event: MessageEvent) => {
                try {
                  const data = JSON.parse(event.data);
                  if (data.type === 'booking') {
                    const receivedAt = Date.now();
                    const latencyMs = receivedAt - startTime;
                    client.removeEventListener('message', handler);
                    resolve({
                      clientId: i + 1,
                      latencyMs,
                      receivedAt,
                      eventData: data,
                    });
                  }
                } catch {
                  // Ignore parse errors
                }
              };

              client.addEventListener('message', handler);
            });
          });

          // Create booking
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 5 + eventNum);
          tomorrow.setHours(10 + eventNum, 0, 0, 0);
          const startBookingTime = tomorrow.toISOString();

          const endDate = new Date(tomorrow);
          endDate.setHours(11 + eventNum, 0, 0, 0);
          const endTime = endDate.toISOString();

          const bookingRes = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              listingId: testListingId,
              startTime: startBookingTime,
              endTime,
              totalPrice: 100,
              notes: `Sequential event test ${eventNum + 1}`,
            }),
          });

          expect(bookingRes.status).toBe(201);
          const bookingData = await bookingRes.json();
          const sequentialBookingId = bookingData.data?.id;

          // Wait for all clients to receive event
          const measurements = await Promise.race([
            Promise.all(eventPromises),
            new Promise<LatencyMeasurement[]>((_, reject) =>
              setTimeout(() => reject(new Error(`Event ${eventNum + 1} timeout`)), 2000)
            ),
          ]);

          allMeasurements.push(measurements);

          // Log measurements for this event
          measurements.forEach((m) => {
            console.log(`  Client ${m.clientId}: ${m.latencyMs}ms`);
            expect(m.latencyMs).toBeLessThan(MAX_LATENCY_MS);
          });

          // Clean up booking
          await fetch(`${API_URL}/api/bookings/${sequentialBookingId}`, {
            method: 'DELETE',
            headers,
          }).catch(() => {
            // Ignore cleanup errors
          });

          // Small delay between events
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Calculate overall statistics
        const allLatencies = allMeasurements.flat().map(m => m.latencyMs);
        const avgLatency = allLatencies.reduce((sum, l) => sum + l, 0) / allLatencies.length;
        const maxLatency = Math.max(...allLatencies);
        const minLatency = Math.min(...allLatencies);

        console.log('\nOverall latency statistics across all events:');
        console.log(`  Total measurements: ${allLatencies.length}`);
        console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
        console.log(`  Min: ${minLatency}ms`);
        console.log(`  Max: ${maxLatency}ms`);
        console.log(`  All under ${MAX_LATENCY_MS}ms: ✓`);

        expect(maxLatency).toBeLessThan(MAX_LATENCY_MS);
      } finally {
        // Close all clients
        clients.forEach(client => {
          try {
            client.close();
          } catch {
            // Ignore close errors
          }
        });
      }
    });
  });

  describe('Peak Load Latency', () => {
    it('should handle rapid sequential bookings with consistent latency', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      const NUM_RAPID_EVENTS = 3;
      const client = await createConnectedClient(1, TENANT_ID);

      try {
        console.log('Testing rapid sequential booking events...');
        await new Promise(resolve => setTimeout(resolve, 200));

        const measurements: LatencyMeasurement[] = [];
        let receivedCount = 0;

        // Set up listener for multiple events
        client.addEventListener('message', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'booking') {
              const receivedAt = Date.now();
              receivedCount++;
              measurements.push({
                clientId: 1,
                latencyMs: 0, // Will be calculated differently for rapid events
                receivedAt,
                eventData: data,
              });
            }
          } catch {
            // Ignore parse errors
          }
        });

        // Create rapid sequential bookings
        const bookingIds: string[] = [];
        const sendTimes: number[] = [];

        for (let i = 0; i < NUM_RAPID_EVENTS; i++) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 10 + i);
          tomorrow.setHours(10, 0, 0, 0);
          const startBookingTime = tomorrow.toISOString();

          const endDate = new Date(tomorrow);
          endDate.setHours(11, 0, 0, 0);
          const endTime = endDate.toISOString();

          sendTimes.push(Date.now());

          const bookingRes = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              listingId: testListingId,
              startTime: startBookingTime,
              endTime,
              totalPrice: 100,
              notes: `Rapid event ${i + 1}`,
            }),
          });

          expect(bookingRes.status).toBe(201);
          const bookingData = await bookingRes.json();
          bookingIds.push(bookingData.data?.id);

          // Very small delay (50ms) between bookings to simulate rapid succession
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Wait for all events to be received
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify all events were received
        expect(receivedCount).toBe(NUM_RAPID_EVENTS);

        // Calculate latencies based on send times
        for (let i = 0; i < measurements.length; i++) {
          measurements[i].latencyMs = measurements[i].receivedAt - sendTimes[i];
        }

        console.log('\nRapid event latencies:');
        measurements.forEach((m, i) => {
          console.log(`  Event ${i + 1}: ${m.latencyMs}ms`);
          expect(m.latencyMs).toBeLessThan(MAX_LATENCY_MS);
        });

        const avgLatency = measurements.reduce((sum, m) => sum + m.latencyMs, 0) / measurements.length;
        console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
        console.log(`  All under ${MAX_LATENCY_MS}ms: ✓`);

        // Clean up bookings
        for (const bookingId of bookingIds) {
          await fetch(`${API_URL}/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers,
          }).catch(() => {
            // Ignore cleanup errors
          });
        }
      } finally {
        client.close();
      }
    });
  });
});
