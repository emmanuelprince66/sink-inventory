"use client";

import CreateShippingMethod from "../CreateShippingMethod";

const EditShipping = ({ id }: { id: string }) => {
  return (
    <div>
      <CreateShippingMethod id={id} />
    </div>
  );
};

export default EditShipping;
