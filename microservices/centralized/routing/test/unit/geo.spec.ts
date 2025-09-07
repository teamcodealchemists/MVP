import axios from "axios";
import { geocodeAddress, haversine } from "../../src/interfaces/geo";

jest.mock("axios");

describe("geocodeAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("usa la cache se l'indirizzo è già presente", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [{ lat: "45.4642", lon: "9.19" }] });
    // Forza la cache
    const address = "Via Roma 1";
    await geocodeAddress(address); // prima chiamata per popolare la cache
    (axios.get as jest.Mock).mockClear(); // reset mock axios

    // Seconda chiamata: dovrebbe usare la cache interna e NON chiamare axios
    const result = await geocodeAddress(address);
    expect(result).toEqual([45.4642, 9.19]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("lancia errore se la risposta è vuota", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    await expect(geocodeAddress("Indirizzo inesistente")).rejects.toThrow(
      "Impossibile geocodificare l'indirizzo: Indirizzo inesistente"
    );
  });

  it("geocodifica e salva in cache se non presente", async () => {
    const address = "Via Milano 2";
    const coords = { lat: "45.5", lon: "9.2" };
    (axios.get as jest.Mock).mockResolvedValue({ data: [coords] });

    const result = await geocodeAddress(address);
    expect(result).toEqual([45.5, 9.2]);
    expect(axios.get).toHaveBeenCalledWith(
      "https://nominatim.openstreetmap.org/search",
        expect.objectContaining({
            params: expect.objectContaining({
            q: address,
            format: "json",
            limit: 1,
            }),
            headers: expect.objectContaining({
            "User-Agent": "warehouse-distance-service",
            }),
        })
    );
});
});

describe("haversine", () => {
  it("calcola la distanza tra due coordinate note", () => {
    // Milano (45.4642, 9.19) e Roma (41.9028, 12.4964)
    const milano: [number, number] = [45.4642, 9.19];
    const roma: [number, number] = [41.9028, 12.4964];
    const distanza = haversine(milano, roma);
    // La distanza reale è circa 477km, tolleranza 10km
    expect(distanza / 1000).toBeGreaterThan(467);
    expect(distanza / 1000).toBeLessThan(487);
  });

  it("la distanza tra due punti uguali è zero", () => {
    const coord: [number, number] = [45.4642, 9.19];
    expect(haversine(coord, coord)).toBeCloseTo(0);
  });
});