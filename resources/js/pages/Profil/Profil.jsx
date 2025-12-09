import React, { useRef, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import { useNotify } from "@/components/ToastNotification";

export default function Profil() {
    const { props } = usePage();
    const { user } = props;
    const fileInputRef = useRef(null);

    const { notifySuccess, notifyError } = useNotify();

    // === STATE CROPPER ===
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [maskSize, setMaskSize] = useState(250);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // === STATE MODAL HAPUS (BARU) ===
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        nm_lengkap: user.nm_lengkap || "",
        email: user.email || "",
        password: "",
        no_hp: user.no_hp || "",
        no_kk: user.no_kk || "",
        alamat: user.alamat || "",
        status: user.status || "",
        rt: user.rt || "",
        rw: user.rw || "",
        kode_pos: user.kode_pos || "",
        role_id: user.role_id || "",
        kelurahan_id: user.kelurahan_id || "",
        kecamatan_id: user.kecamatan_id || "",
        kota_id: user.kota_id || "",
    });

    const [isEditing, setIsEditing] = useState(false);

    // === 1. FUNGSI UNTUK MEMBUKA MODAL KONFIRMASI ===
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    // === 2. FUNGSI EKSEKUSI HAPUS (DIPANGGIL DARI MODAL) ===
    const executeDeletePhoto = () => {
        router.delete(route("profil.deletePhoto", user.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false); // Tutup modal
                notifySuccess("Dihapus", "Foto profil berhasil dihapus.");
            },
            onError: () => {
                setIsDeleteModalOpen(false);
                notifyError("Gagal", "Terjadi kesalahan saat menghapus foto.");
            },
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setMaskSize(250);

        const objectUrl = URL.createObjectURL(file);
        setImageSrc(objectUrl);
        setIsCropping(true);
        e.target.value = null;
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const uploadCroppedImage = () => {
        if (isProcessing) return;
        setIsProcessing(true);

        if (!selectedFile || !croppedAreaPixels) {
            notifyError(
                "Gagal Memproses",
                "Data gambar belum siap. Silakan geser gambar sedikit."
            );
            setIsProcessing(false);
            return;
        }

        const form = new FormData();
        form.append("foto_profil", selectedFile);
        form.append("crop_x", Math.round(croppedAreaPixels.x));
        form.append("crop_y", Math.round(croppedAreaPixels.y));
        form.append("crop_width", Math.round(croppedAreaPixels.width));
        form.append("crop_height", Math.round(croppedAreaPixels.height));

        router.post(route("profil.updatePhoto", user.id), form, {
            forceFormData: true,
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                handleCloseCropper();
                notifySuccess("Berhasil", "Foto profil berhasil diperbarui!");
            },
            onError: (e) => {
                console.error("Error upload:", e);
                notifyError(
                    "Gagal Upload",
                    "Terjadi kesalahan saat mengupload foto."
                );
            },
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            router.put(route("profil.update", user.id), formData, {
                onSuccess: () => {
                    setIsEditing(false);
                    notifySuccess(
                        "Disimpan",
                        "Data profil berhasil diperbarui."
                    );
                },
                onError: (errors) => {
                    notifyError(
                        "Gagal Menyimpan",
                        "Periksa kembali inputan Anda."
                    );
                },
            });
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            nm_lengkap: user.nm_lengkap || "",
            email: user.email || "",
            password: "",
            no_hp: user.no_hp || "",
            no_kk: user.no_kk || "",
            alamat: user.alamat || "",
            status: user.status || "",
            rt: user.rt || "",
            rw: user.rw || "",
            kode_pos: user.kode_pos || "",
            role_id: user.role_id || "",
            kelurahan_id: user.kelurahan_id || "",
            kecamatan_id: user.kecamatan_id || "",
            kota_id: user.kota_id || "",
        });
    };

    const handleCloseCropper = () => {
        setIsCropping(false);
        setImageSrc(null);
        setSelectedFile(null);
        setZoom(1);
        setMaskSize(250);
        setCroppedAreaPixels(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-yellow-100 p-10">
                
                {/* ====== MODAL KONFIRMASI HAPUS (BARU & MODERN) ====== */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                            {/* Icon Peringatan */}
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Hapus Foto Profil?
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Apakah Anda yakin ingin menghapus foto profil ini? Foto akan kembali ke tampilan default (inisial/avatar).
                            </p>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={executeDeletePhoto}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-md shadow-red-200"
                                >
                                    Ya, Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ====== MODAL CROPPER ====== */}
                {isCropping && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-700">
                                    Atur Foto Profil
                                </h3>
                                <button
                                    onClick={handleCloseCropper}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="relative w-full h-80 bg-gray-900 flex items-center justify-center">
                                <Cropper
                                    image={imageSrc}
                                    key={imageSrc}
                                    restrictPosition={false}
                                    minZoom={0.5}
                                    maxZoom={3}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    cropSize={{
                                        width: maskSize,
                                        height: maskSize,
                                    }}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    onMediaLoaded={() => {
                                        setZoom(1);
                                        setCrop({ x: 0, y: 0 });
                                    }}
                                />
                            </div>

                            <div className="p-6 bg-white flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Zoom Gambar
                                    </label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-lg">🖼️</span>
                                        <input
                                            type="range"
                                            value={zoom}
                                            min={0.5}
                                            max={3}
                                            step={0.05}
                                            onChange={(e) =>
                                                setZoom(Number(e.target.value))
                                            }
                                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Ukuran Lingkaran
                                    </label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-lg">⭕</span>
                                        <input
                                            type="range"
                                            value={maskSize}
                                            min={150}
                                            max={300}
                                            step={10}
                                            onChange={(e) =>
                                                setMaskSize(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <Button
                                        onClick={handleCloseCropper}
                                        disabled={isProcessing}
                                        variant="outline"
                                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={uploadCroppedImage}
                                        disabled={isProcessing}
                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                                    >
                                        {isProcessing
                                            ? "Menyimpan..."
                                            : "Simpan Foto"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ====== HEADER ====== */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    {/* Container Foto & Tombol Hapus disusun Vertikal */}
                    <div className="flex flex-col items-center gap-2">
                        {/* Wrapper Foto Lingkaran */}
                        <div className="relative group">
                            <img
                                src={
                                    user.foto_profil
                                        ? `/storage/foto_profil/${
                                              user.foto_profil
                                          }?t=${new Date().getTime()}`
                                        : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                                }
                                alt="Foto Profil"
                                onClick={() => fileInputRef.current.click()}
                                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white cursor-pointer hover:brightness-90 transition bg-white"
                            />
                            
                            {/* Overlay Hover Icon Kamera */}
                            <div
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <span className="text-white text-2xl">📷</span>
                            </div>
                        </div>

                        {/* Input File Hidden */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                        />

                        {/* === UPDATE: MENGGUNAKAN MODAL CUSTOM === */}
                        {user.foto_profil && (
                            <button
                                onClick={handleDeleteClick} 
                                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-red-50 transition-colors font-medium"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                    />
                                </svg>
                                Hapus Foto
                            </button>
                        )}
                    </div>

                    <div>
                        <h1 className="text-5xl font-bold text-gray-900">
                            Hai, ini profilmu!
                        </h1>
                        <h2 className="text-4xl font-semibold text-gray-800 mt-2">
                            {formData.nm_lengkap}
                        </h2>
                    </div>
                </div>

                {/* ====== FORM (TIDAK ADA PERUBAHAN) ====== */}
                <div className="bg-white rounded-3xl shadow-xl p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-5">
                            <InputField
                                label="Nama"
                                name="nm_lengkap"
                                value={formData.nm_lengkap}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <InputField
                                    label="Password Baru"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            )}
                            <InputField
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="No Handphone"
                                name="no_hp"
                                value={formData.no_hp}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Role"
                                value={
                                    formData.role_id === 1
                                        ? "Superadmin"
                                        : formData.role_id === 2
                                        ? "Ketua RT"
                                        : formData.role_id === 3
                                        ? "Bendahara"
                                        : formData.role_id === 4
                                        ? "Sekretaris"
                                        : "Warga"
                                }
                                disabled
                            />
                            <InputField
                                label="Kode Pos"
                                name="kode_pos"
                                value={formData.kode_pos}
                                onChange={handleChange}
                                disabled={true}
                            />
                            <InputField
                                label="Kelurahan"
                                name="kelurahan_nama"
                                value={user.kelurahan_nama}
                                onChange={handleChange}
                                disabled={true}
                            />
                            <InputField
                                label="Kota"
                                name="kota_nama"
                                value={user.kota_nama}
                                onChange={handleChange}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-col gap-5">
                            <InputField
                                label="Alamat"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={true}
                            />
                            <InputField
                                label="Nomor KK"
                                name="no_kk"
                                value={formData.no_kk}
                                onChange={handleChange}
                                disabled={true}
                            />
                            <InputField
                                label="RT"
                                name="rt"
                                value={formData.rt}
                                onChange={handleChange}
                                disabled={true}
                            />
                            <InputField
                                label="RW"
                                name="rw"
                                value={formData.rw}
                                onChange={handleChange}
                                disabled={true}
                            />
                           <InputField
                                label="Kecamatan"
                                name="kecamatan_nama"
                                value={user.kecamatan_nama}
                                onChange={handleChange}
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleCancelEdit}
                                    variant="secondary"
                                    className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors border-none"
                                >
                                    Batal
                                </Button>

                                <Button
                                    onClick={handleEditToggle}
                                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                                >
                                    Simpan Data
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleEditToggle}
                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                Edit Data
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InputField({ label, name, value, onChange, disabled, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                className={`w-full border rounded-xl px-4 py-2 transition-colors ${
                    disabled
                        ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
            />
        </div>
    );
}