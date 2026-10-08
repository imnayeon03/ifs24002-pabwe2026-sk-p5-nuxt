import { describe, it, expect } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog, showErrorDialog, showWarningDialog, showConfirmDialog, formatRupiah, formatDate,
} from "./toolsHelper";

describe("dialog", () => {
  it("success/error/warning memanggil Swal", async () => {
    await showSuccessDialog("a");
    await showErrorDialog("b");
    await showWarningDialog("c");
    const icons = vi.mocked(Swal.fire).mock.calls.map((c) => (c[0] as { icon: string }).icon);
    expect(icons).toEqual(["success", "error", "warning"]);
  });

  it("confirm mengembalikan isConfirmed", async () => {
    expect(await showConfirmDialog("t", "x")).toBe(true);
    expect((vi.mocked(Swal.fire).mock.calls[0][0] as { confirmButtonText: string }).confirmButtonText).toBe("Ya");
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as never);
    expect(await showConfirmDialog("t", "x", "Hapus")).toBe(false);
  });
});

describe("format", () => {
  it("formatRupiah", () => {
    expect(formatRupiah(1500000).replace(/\s/g, " ")).toBe("Rp 1.500.000");
    expect(formatRupiah("abc").replace(/\s/g, " ")).toBe("Rp 0");
  });
  it("formatDate", () => {
    expect(formatDate("2026-10-07T10:30:00")).toContain("Oktober 2026");
    expect(formatDate("")).toBe("-");
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
  });
});
