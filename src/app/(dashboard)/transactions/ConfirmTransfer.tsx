const ConfirmTransfer = () => {
  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <p className="text-[12px] font-bold text-gray-800 mb-6">
        Confirm Transfer
      </p>

      <p className="text-gray-600 mb-6">
        Transfer the amount you wish to fund to the virtual account provided
        below.
      </p>

      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3 font-medium text-gray-700">Bank Name:</td>
              <td className="py-3 text-gray-600">VFD MICROFINANCE BANK</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 font-medium text-gray-700">
                Account Number:
              </td>
              <td className="py-3 text-gray-600">1036840540</td>
            </tr>
            <tr>
              <td className="py-3 font-medium text-gray-700">Account Name:</td>
              <td className="py-3 text-gray-600">
                MYCLIQ-OLUWATOBILOBA OLOSUNDE
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        This virtual account is unique and tied to your MyCliq account.
        <br />
        Any amount transferred to this account will reflect in your wallet
        immediately.
      </p>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-3">
          Do more with your virtual account?
        </h2>
        <p className="text-gray-600 mb-4">
          You can download and even print your account details as a poster and
          receive payments seamlessly!
        </p>
      </div>

      <div className="flex flex-col space-y-4 mb-4">
        <button className="w-full py-3 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors">
          View Virtual Account Poster
        </button>
      </div>
      <button className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
        Transfer
      </button>
    </div>
  );
};

export default ConfirmTransfer;
