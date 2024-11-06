"use client";

import { Toaster } from 'react-hot-toast';
import LottoPage from "../components/LottoPage"
import Header from "../components/Header";
import { AppProvider } from "../contexts/AppContext";

export default function Home() {
  return (
    <AppProvider>
      <div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "custom-toast",
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: 'green',
              },
            },
            error: {
              style: {
                background: 'red',
              },
            },
          }}
        />
        <Header />
        <LottoPage />
      </div>
    </AppProvider>
  );
}
