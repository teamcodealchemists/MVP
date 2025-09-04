import { validate } from "class-validator";
import { aboveMaxThresDto } from "src/interfaces/http/dto/aboveMaxThres.dto";

describe("aboveMaxThresDto Validation", () => {
  it("should validate a correct DTO", async () => {
    const dto = new aboveMaxThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000";
    dto.quantity = 10;
    dto.maxThres = 50;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail if id is not a valid UUID", async () => {
    const dto = new aboveMaxThresDto();
    dto.id = "not-a-uuid";
    dto.quantity = 10;
    dto.maxThres = 50;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("id");
  });

  it("should fail if quantity is negative", async () => {
    const dto = new aboveMaxThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000";
    dto.quantity = -1;
    dto.maxThres = 50;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("quantity");
  });

  it("should fail if maxThres is negative", async () => {
    const dto = new aboveMaxThresDto();
    dto.id = "550e8400-e29b-41d4-a716-446655440000";
    dto.quantity = 10;
    dto.maxThres = -5;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("maxThres");
  });
});