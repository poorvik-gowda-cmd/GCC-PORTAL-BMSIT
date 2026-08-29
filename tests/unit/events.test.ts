import { describe, it, expect } from "vitest";
import { EventsAdapter } from "../../packages/google-adapters/src/adapters/eventsAdapter";

describe("Events & Registration Rules", () => {
  it("should generate stable registration IDs matching the format", () => {
    const regId = EventsAdapter.generateRegistrationId(2026, 1, 45);
    expect(regId).toBe("REG-2026-001-0045");
  });

  it("should format registration IDs with correct padding", () => {
    const regId1 = EventsAdapter.generateRegistrationId(2026, 12, 1);
    expect(regId1).toBe("REG-2026-012-0001");

    const regId2 = EventsAdapter.generateRegistrationId(2027, 105, 9999);
    expect(regId2).toBe("REG-2027-105-9999");
  });
});
