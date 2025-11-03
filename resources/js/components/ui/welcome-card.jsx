import React from "react";

export function WelcomeCard({ name = "Superadmin", lastUpdate = "11/12/2025" }) {
  return (
    <div className="text-black px-4 py-4 mt-4 mx-2">
      <h2 className="text-lg font-bold leading-tight">
        Selamat Datang,<br />{name}!
      </h2>
      <p className="text-sm text-gray/80 mt-1">
        Last Update, {lastUpdate}
      </p>
    </div>
  );
}
