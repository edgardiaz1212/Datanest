import React, { useState, useEffect, useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import { Context } from '../store/appContext';

const ProtectedImage = ({ src, ...props }) => {
  const { store } = useContext(Context);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let objectUrl = null;

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      const token = store.token || localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
        console.error("ProtectedImage: No se encontró token de autenticación.");
        return;
      }

      try {
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Fallo al obtener la imagen: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setImageSrc(objectUrl);
        }

      } catch (err) {
        console.error("Error obteniendo imagen protegida:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    // Función de limpieza para evitar memory leaks
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, store.token]); // Se ejecuta de nuevo si la URL de la imagen o el token cambian

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100%', minHeight: '150px' }}><Spinner animation="border" size="sm" /></div>;
  }

  if (error || !imageSrc) {
    return <div className="d-flex justify-content-center align-items-center bg-light text-muted" style={{ height: '100%', minHeight: '150px' }}>Error al cargar imagen</div>;
  }

  // Pasa todas las demás props (alt, className, style, etc.) a la etiqueta img
  return <img src={imageSrc} {...props} />;
};

export default ProtectedImage;
