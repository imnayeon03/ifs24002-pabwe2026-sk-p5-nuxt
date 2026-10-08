// SweetAlert2 dimuat lazy: baru diunduh saat dialog pertama kali dibutuhkan,
// sehingga tidak membebani bundle awal (Lighthouse: reduce unused JavaScript).
const loadSwal = async () => (await import("sweetalert2")).default;

export function showSuccessDialog(message: string) {
  return loadSwal().then((Swal) => Swal.fire({ icon: "success", title: "Berhasil", text: message, confirmButtonColor: "#4f46e5" }));
}

export function showErrorDialog(message: string) {
  return loadSwal().then((Swal) => Swal.fire({ icon: "error", title: "Gagal", text: message, confirmButtonColor: "#4f46e5" }));
}

export function showWarningDialog(message: string) {
  return loadSwal().then((Swal) => Swal.fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: "#4f46e5" }));
}

/** Dialog konfirmasi. Mengembalikan true jika pengguna menekan tombol konfirmasi. */
export async function showConfirmDialog(
  title: string,
  text: string,
  confirmText = "Ya"
): Promise<boolean> {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#64748b",
  });

  return result.isConfirmed;
}

/** 1500000 => "Rp 1.500.000" */
export function formatRupiah(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/** "2026-10-07T10:30:00Z" => "7 Oktober 2026 ..." ; nilai tidak valid => "-" */
export function formatDate(value?: string | null): string {
  const date = new Date(value ?? "");

  if (!value || Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}