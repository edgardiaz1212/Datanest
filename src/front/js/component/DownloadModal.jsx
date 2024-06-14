import React, { useContext } from 'react';
import { PDFDocument, PDFTextField, PDFDropdown, PDFCheckBox, PDFRadioGroup} from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Context } from '../store/appContext';
import pdfBase from '../../pdf/FOR BA7D ED5.pdf'

function DownloadModal() {
    const { actions, store } = useContext(Context);


const fillField = (field, value) => {
  if (field instanceof PDFTextField) {
      field.setText(value || 'N/A');
  } else if (field instanceof PDFDropdown) {
      field.select(value || 'N/A');
  } else if (field instanceof PDFCheckBox) {
      if (value === "Yes") {
          field.check();
      } else {
          field.uncheck();
      }
  } else if (field instanceof PDFRadioGroup) {
      field.select(value || 'N/A');
  }
};

const handleDownload = async () => {
  const zip = new JSZip();

  // Lógica para llenar y agregar cada PDF al zip
  const descriptions = store.descriptions
  //await actions.getDescriptionsByUser();
  console.log("Descriptions:", descriptions);

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

      console.log("Data for ID", id, ":", data);

      if (!data) {
          console.error("No se encontraron datos para llenar el PDF.");
          continue;
      }

      // Carga el PDF base.
      const pdfBuffer = await fetch(pdfBase).then((response) => response.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Llena los campos del PDF base con los valores capturados.
      const form = pdfDoc.getForm();
      
      fillField(form.getTextField('UNIDAD_SOLICITANTE'), data.user ? data.user.coordination : null);
      fillField(form.getTextField('PERSONA_SOLICITANTE'), data.user ? data.user.username : null);
      fillField(form.getTextField('FECHA_SOLICITUD'), data.user ? data.user.created_at : null);
      fillField(form.getTextField('CLIENTE_FINAL'), data.user ? data.user.clientName : null);
      fillField(form.getTextField('PREVISION'), data.description ? data.description.five_years_prevition : null);
      fillField(form.getTextField('OBSERVACIONES'), data.description ? data.description.observations : null);
      fillField(form.getDropdown('Servicio'), data.description ? data.description.requestType : null); // Cambiado a getDropdown
      fillField(form.getTextField('MARCA'), data.description ? data.description.brand : null);
      fillField(form.getTextField('MODELO'), data.description ? data.description.model : null);
      fillField(form.getTextField('SERIAL'), data.description ? data.description.serial : null);
      fillField(form.getTextField('N/P'), data.description ? data.description.partNumber : null);
      fillField(form.getTextField('TIPO_COMPONENTE'), data.description ? data.description.componentType : null);

      // Rack fields
      if (modelType === "Rack") {
          fillField(form.getRadioGroup('GABINETE'), data.has_cabinet ? "SI" : "NO");
           fillField(form.getRadioGroup('PROPIO_ARRENDADO'), data.leased ? "arrendado" : "Opción1");
           fillField(form.getTextField('Total_Gabinetes'), data.total_cabinets);
           fillField(form.getRadioGroup('ABIERTO_CERRADO'), data.open_closed ? "Cerrado" : "abierto");
          fillField(form.getRadioGroup('SEGURIDAD'), data.security ? "SI" : "NO");
          fillField(form.getTextField('Tipo_Seguridad'), data.type_security);
          fillField(form.getRadioGroup('EXTRACTORES'), data.has_extractors ? "SI" : "NO");
           fillField(form.getTextField('Ubicacion_Extractores'), data.extractors_ubication);
           fillField(form.getRadioGroup('MODULAR'), data.modular ? "SI" : "NO");
           fillField(form.getRadioGroup('PUERTAS'), data.lateral_doors ? "SI" : "NO");
          fillField(form.getTextField('Ubicacion_Puertas'), data.lateral_ubication);
           fillField(form.getTextField('Total_RU'), data.rack_unit);
           fillField(form.getTextField('Posicion_Rack'), data.rack_position);
           fillField(form.getRadioGroup('ACCESORIOS'), data.has_accessory ? "SI" : "NO");
          fillField(form.getTextField('Tipo_Accesorio'), data.accessory_description);
           fillField(form.getTextField('Alto_Rack'), data.rack_height);
           fillField(form.getTextField('Ancho_Rack'), data.rack_width);
           fillField(form.getTextField('Profundo_Rack'), data.rack_length);
           fillField(form.getTextField('PDU_Internos'), data.internal_pdu);
           fillField(form.getTextField('Toma_Entrada'), data.input_connector);
           fillField(form.getTextField('Fases'), data.fases);
           fillField(form.getTextField('Receptaculos'), data.output_connector);
           fillField(form.getRadioGroup('NEUTRO'), data.neutro ? "si" : "no");
      }

      // Equipment fields
      if (modelType !== "Rack") {
          fillField(form.getTextField('Alto_Equipo'), data.equipment_height);
          fillField(form.getTextField('Ancho_Equipo'), data.equipment_width);
          fillField(form.getTextField('Profundidad_Equipo'), data.equipment_length);
          fillField(form.getTextField('Alto_Embalaje'), data.packaging_height);
          fillField(form.getTextField('Ancho_Embalaje'), data.packaging_width);
          fillField(form.getTextField('Profundidad embalaje'), data.packaging_length);
          fillField(form.getTextField('Peso_Maximo'), data.weight);
          fillField(form.getTextField('Tipo_Anclaje'), data.anchor_type);
          fillField(form.getRadioGroup('SERVICIO'), data.service_area ? "Sí" : "no");
          // fillField(form.getCheckBox('frontal'), data.service_frontal ? "Yes" : "no");
          // fillField(form.getCheckBox('posterior'), data.service_back ? "Yes" : "no");
          // fillField(form.getCheckBox('lateral'), data.service_lateral ? "Yes" : "no");
          fillField(form.getTextField('Altura_Puerta'), data.access_length);
          fillField(form.getTextField('Ancho_Puerta'), data.access_width);
          fillField(form.getTextField('Inclinacion_Puerta'), data.access_inclination);
          fillField(form.getTextField('Ubicacion_fila_Numero_Rack'), data.rack_number);
          fillField(form.getTextField('Posicion_U'), data.rack_unit_position);
          fillField(form.getTextField('Total_Unidades'), data.total_rack_units);
          fillField(form.getTextField('ACDC'), data.ac_dc);
          fillField(form.getTextField('Voltios'), data.input_current);
          fillField(form.getTextField('Potencia'), data.power);
          fillField(form.getTextField('Fuentes_Alimentacion'), data.power_supply);
          fillField(form.getTextField('Temperatura'), data.operation_temp);
          fillField(form.getTextField('BTUHr'), data.thermal_disipation);
          fillField(form.getDropdown('Fuentes'), data.power_config); // Cambiado a getDropdown
      }

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

  // Genera el archivo zip y descarga
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'forms.zip');
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
        tabIndex="-1"
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
              Finalizado la carga de las planillas.  ahora puede descargarlo para
              enviarlo a requerimientosdcce@cantv.com.ve conjunto a los
              datasheets de los equipos.
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
              <button type="button" className="btn btn-primary"  onClick={handleDownload}>
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
