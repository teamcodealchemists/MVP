// test/unit/belowMinThresDto.spec.ts
import { validate } from "class-validator";
import { belowMinThresDto } from "src/interfaces/http/dto/belowMinThres.dto";

describe("belowMinThresDto Validation", () => {
  it("should validate a correct DTO", async () => {
    const dto = new belowMinThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000"; // valid UUID
    dto.quantity = 10;
    dto.minThres = 2;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail if id is not a valid UUID", async () => {
    const dto = new belowMinThresDto();
    dto.id = "invalid-uuid";
    dto.quantity = 10;
    dto.minThres = 2;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("id");
  });

  it("should fail if quantity is negative", async () => {
    const dto = new belowMinThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000";
    dto.quantity = -5;
    dto.minThres = 2;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("quantity");
  });

  it("should fail if minThres is negative", async () => {
    const dto = new belowMinThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000";
    dto.quantity = 10;
    dto.minThres = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("minThres");
  });
});
