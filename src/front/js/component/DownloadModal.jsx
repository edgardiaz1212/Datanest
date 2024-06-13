import React, { useContext } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Context } from '../store/appContext';

function DownloadModal() {
    const { actions, store } = useContext(Context);

    const fillField = (field, value) => {
        if (!value) {
            field.setText('N/A');
        } else {
            field.setText(value);
        }
    };

    const handleDownload = async () => {
        const zip = new JSZip();

        // Lógica para llenar y agregar cada PDF al zip
        const descriptions = await actions.getDescriptionsByUser();
        if (!descriptions || descriptions.length === 0) {
            console.error("No se encontraron descripciones para generar PDFs.");
            return;
        }

        for (const desc of descriptions) {
            const id = desc.id;
            const modelType = desc.componentType;
            let data = null;

            if (modelType === "Rack") {
                data = await actions.getRackByDescriptionId(id);
            } else {
                data = await actions.getEquipmentByDescriptionId(id);
            }

            if (!data) {
                console.error("No se encontraron datos para llenar el PDF.");
                continue;
            }

            // Carga el PDF base.
            const pdfBuffer = await fetch(PDfBase).then((response) => response.arrayBuffer());
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Llena los campos del PDF base con los valores capturados.
            const form = pdfDoc.getForm();
            fillField(form.getTextField('UNIDAD_SOLICITANTE'), data.user ? data.user.coordination : null);
            fillField(form.getTextField('PERSONA_SOLICITANTE'), data.user ? data.user.username : null);
            fillField(form.getTextField('FECHA_SOLICITUD'), data.user ? data.user.created_at : null);
            fillField(form.getTextField('CLIENTE_FINAL'), data.user ? data.user.clientName : null);
            fillField(form.getTextField('PREVISION'), data.description ? data.description.five_years_prevition : null);
            fillField(form.getTextField('OBSERVACIONES'), data.description ? data.description.observations : null);
            // Llena los demás campos del PDF base...

            // Genera un nombre único para el PDF basado en el tipo de modelo y un número incremental si es necesario
            let pdfName = `${modelType}`;
            let count = 1;
            while (zip.file(`${pdfName}.pdf`)) {
                pdfName = `${modelType}_${count}`;
                count++;
            }

            // Guarda el PDF llenado en el zip
            const pdfBytes = await pdfDoc.save();
            zip.file(`${pdfName}.pdf`, pdfBytes);
        }

        // Genera el archivo comprimido
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Descarga el archivo comprimido
        saveAs(zipBlob, "Planillas.zip");
    };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Descargar todo
      </button>

      <div
        className="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Culminar Registro
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Si ya realizo la carga de todos ahora puede descargarlo todo para
              enviarlo a requerimientosdcce@cantv.com.ve conjunto a los
              datasheets de los equipos
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleDownload}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-primary">
                Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DownloadModal;
