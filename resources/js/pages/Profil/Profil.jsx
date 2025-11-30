import React, { useRef, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";

export default function Profil() {
    const { props } = usePage();
    const { user } = props;
    const fileInputRef = useRef(null);

    // === STATE CROPPER ===
    const [imageSrc, setImageSrc] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [maskSize, setMaskSize] = useState(250);

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
    });

    const [isEditing, setIsEditing] = useState(false);

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
            alert("Data gambar belum siap. Silakan geser gambar sedikit.");
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
            onSuccess: () => handleCloseCropper(),
            onError: (e) => {
                console.error("Error upload:", e);
                alert("Gagal upload foto. Pastikan ukuran file tidak terlalu besar.");
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
                onSuccess: () => setIsEditing(false),
            });
        } else {
            setIsEditing(true);
        }
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
                {/* ====== MODAL CROPPER ====== */}
                {isCropping && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
                        {/* PERBAIKAN DI SINI:
                            Hapus 'zoom-in' dari className.
                            Ganti jadi 'fade-in' atau 'slide-in-from-bottom-5' agar dimensi stabil saat init.
                        */}
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
                                            onChange={(e) => setZoom(Number(e.target.value))}
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
                                            onChange={(e) => setMaskSize(Number(e.target.value))}
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
                    <div className="relative group">
                        <img
                            src={
                                user.foto_profil
                                    ? `/storage/foto_profil/${user.foto_profil}?t=${new Date().getTime()}`
                                    : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                            }
                            alt="Foto Profil"
                            onClick={() => fileInputRef.current.click()}
                            className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white cursor-pointer hover:brightness-90 transition bg-white"
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <span className="text-white text-2xl">📷</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
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

                {/* ====== FORM ====== */}
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
                                    formData.role_id === 1 ? "Superadmin" :
                                    formData.role_id === 2 ? "Ketua RT" :
                                    formData.role_id === 3 ? "Bendahara" :
                                    formData.role_id === 4 ? "Sekretaris" :
                                    "Warga"
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
                                disabled={!isEditing}
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
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={handleEditToggle}
                            className={`px-6 py-2 rounded-lg text-white transition-colors ${
                                isEditing
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isEditing ? "Simpan Data" : "Edit Data"}
                        </Button>
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