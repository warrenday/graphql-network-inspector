import { searchString } from "./searchString";

describe("searchString", () => {
  it("returns the match from a string with the given start/end buffer", () => {
    const res = searchString({
      text: "i really want to be searched",
      search: "wan",
      buffer: 5,
    });

    expect(res).toEqual({
      start: "ally ",
      match: "wan",
      end: "t to ",
    });
  });

  it("handles searched when matched portion is at the start", () => {
    const res = searchString({
      text: "i really want to be searched",
      search: "i",
      buffer: 5,
    });

    expect(res).toEqual({
      start: "",
      match: "i",
      end: " real",
    });
  });

  it("handles searched when matched portion is at the end", () => {
    const res = searchString({
      text: "i really want to be searched",
      search: "searched",
      buffer: 5,
    });

    expect(res).toEqual({
      start: "o be ",
      match: "searched",
      end: "",
    });
  });
});
