import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// SweetAlert2 selalu "konfirmasi" agar dialog tidak membuka UI sungguhan.
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
