const Payment = () => {
  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-gray-500 italic -mt-2">
          Online payment is not currently enabled for your store. Set up payment
          to start accepting payments.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              /* navigate to payment setup */
            }}
            className="w-full cursor-pointer rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 transition-colors"
          >
            Set up payment
          </button>

          <button className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Payment;
