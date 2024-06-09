import React from 'react';
import RackDetails from '../component/RackDetails.jsx';
import EquipmentDetails from '../component/EquipmentDetails.jsx';
import { useLocation } from "react-router-dom";

function CompleteData() {
  const location = useLocation();
  const { entry } = location.state || {};
  const { componentType, requestType, brand, model, serial, partNumber } = entry || {};

  return (
    <>
el {componentType} modelo {model}

      {componentType === 'Rack' && <RackDetails requestType={requestType} brand={brand} model={model} serial={serial} partNumber={partNumber} />}
      {componentType !== 'Rack' && <EquipmentDetails requestType={requestType} brand={brand} model={model} serial={serial} partNumber={partNumber} />}
    </>
  );
}

export default CompleteData;