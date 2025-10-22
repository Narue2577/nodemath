// components/PrivacyPolicyModal.tsx

interface PrivacyPolicyModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function PrivacyPolicyModal({ onClose, onConfirm }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>
        <h2 className="mb-6 text-3xl font-bold text-center">นโยบายการคุ้มครองข้อมูลส่วนบุคคล</h2>
        <h2 className="mb-6 text-3xl font-bold text-center">(Privacy Policy)</h2>
        <div>
          <h5>เราเคารพสิทธิความเป็นส่วนตัวและความปลอดภัยของข้อมูลส่วนบุคคลของท่าน...</h5>
          <ol className="list-decimal ml-6">
            <li>การเก็บรวบรวมข้อมูลส่วนบุคคล</li>
            <li>แหล่งที่มาของข้อมูล</li>
            <li>วัตถุประสงค์การใช้ข้อมูล</li>
            <li>ระยะเวลาการจัดเก็บข้อมูล</li>
            <li>สิทธิของท่าน</li>
          </ol>
          <p className="mt-4">
            ดูรายละเอียดเพิ่มเติมที่{' '}
            <a href="https://pdpa.swu.ac.th/" className="text-blue-600 underline">
              pdpa.swu.ac.th
            </a>
          </p>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-black bg-white border border-black rounded hover:bg-black hover:text-white"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-900 rounded hover:bg-blue-700"
          >
            สมัครสมาชิก
          </button>
        </div>
      </div>
    </div>
  );
}