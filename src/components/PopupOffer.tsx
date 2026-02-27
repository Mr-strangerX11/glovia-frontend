"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Popup {
  _id: string;
  title: string;
  content: string;
  image?: string;
  link?: string;
  showOnce: boolean;
}

const PopupOffer: React.FC = () => {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      const res = await axios.get('/api/popups/active');
      if (res.data && res.data.length > 0) {
        const popupData = res.data[0];
        if (popupData.showOnce && localStorage.getItem(`popup_shown_${popupData._id}`)) return;
        setPopup(popupData);
        setVisible(true);
      }
    };
    fetchPopup();
  }, []);

  const handleClose = () => {
    if (popup?.showOnce) {
      localStorage.setItem(`popup_shown_${popup._id}`, 'true');
    }
    setVisible(false);
  };

  if (!popup || !visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={handleClose}>&times;</button>
        {popup.image && <img src={popup.image} alt="Popup" className="mb-4 rounded w-full" />}
        <h3 className="text-xl font-bold mb-2">{popup.title}</h3>
        <p className="mb-4">{popup.content}</p>
        {popup.link && <a href={popup.link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Learn More</a>}
      </div>
    </div>
  );
};

export default PopupOffer;
