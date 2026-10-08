import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAccessToken, putAccessToken, removeAccessToken, buildQueryString, fetchApi, isApiSuccess,
} from "./apiHelper";

describe("token storage", () => {
  it("put, get, remove", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("buildQueryString", () => {
  it("mengabaikan nilai kosong", () => {
    expect(buildQueryString({ a: 1, b: "", c: null, d: undefined, e: 0 })).toBe("?a=1&e=0");
  });
  it("kosong => string kosong", () => {
    expect(buildQueryString()).toBe("");
    expect(buildQueryString({ a: "" })).toBe("");
  });
});

describe("isApiSuccess", () => {
  it("mengenali kedua format respons", () => {
    expect(isApiSuccess({ status: "success", message: "" })).toBe(true);
    expect(isApiSuccess({ success: true, message: "" })).toBe(true);
    expect(isApiSuccess({ status: "fail", message: "" })).toBe(false);
    expect(isApiSuccess(undefined)).toBe(false);
    expect(isApiSuccess(null)).toBe(false);
  });
});

describe("fetchApi", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("DELCOM_BASEURL", "http://api.test");
  });

  it("GET tanpa token", async () => {
    const res = await fetchApi("/x", { params: { q: 1 } });
    expect(res).toEqual({ status: "success" });
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/x?q=1", { method: "GET", headers: {} });
  });

  it("memakai default options", async () => {
    await fetchApi("/x");
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/x");
  });

  it("menyertakan Authorization bila ada token", async () => {
    putAccessToken("tok");
    await fetchApi("/x");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("tidak menyertakan Authorization bila auth=false", async () => {
    putAccessToken("tok");
    await fetchApi("/x", { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("body JSON", async () => {
    await fetchApi("/x", { method: "POST", body: { a: 1 } });
    const opt = fetchMock.mock.calls[0][1];
    expect(opt.headers["Content-Type"]).toBe("application/json");
    expect(opt.body).toBe('{"a":1}');
  });

  it("body FormData", async () => {
    const fd = new FormData();
    await fetchApi("/x", { method: "POST", body: fd });
    const opt = fetchMock.mock.calls[0][1];
    expect(opt.body).toBe(fd);
    expect(opt.headers["Content-Type"]).toBeUndefined();
  });

  it("error jaringan => object gagal", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await fetchApi("/x")).toEqual({ success: false, message: "offline" });
  });
});
