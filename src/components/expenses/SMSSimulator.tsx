import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface SMSSimulatorProps {
  onSMSReceived: (sms: string, sender: string) => void;
}

export function SMSSimulator({ onSMSReceived }: SMSSimulatorProps) {
  const [smsBody, setSmsBody] = useState('');
  const [sender, setSender] = useState('HDFC');
  const [showSimulator, setShowSimulator] = useState(false);

  const sampleMessages = [
    {
      sender: 'HDFC',
      body: 'Rs 500.00 debited from A/c XX1234 on 15-02-24 to VPA swiggy@paytm UPI Ref 405678901234',
    },
    {
      sender: 'PAYTM',
      body: 'Your A/c XX5678 debited with Rs.1,250.50 on 15-Feb-24 for UPI/phonepe/9876543210/zomato',
    },
    {
      sender: 'HDFC',
      body: 'Rs 350 spent on your HDFC Card XX9012 at DOMINOS PIZZA on 15-02-2024',
    },
  ];

  const handleSend = () => {
    if (smsBody.trim()) {
      onSMSReceived(smsBody, sender);
      setSmsBody('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        onClick={() => setShowSimulator(!showSimulator)}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
      >
        <MessageSquare className="w-5 h-5" />
        {showSimulator ? 'Hide' : 'Show'} SMS Simulator (Demo)
      </button>

      {showSimulator && (
        <div className="mt-4 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800 mb-3">
              Simulate payment SMS to test auto-tracking
            </p>

            <div className="space-y-2 mb-3">
              <p className="text-xs font-medium text-purple-700">Quick Test Messages:</p>
              {sampleMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSender(msg.sender);
                    setSmsBody(msg.body);
                  }}
                  className="block w-full text-left text-xs bg-white p-2 rounded border border-purple-200 hover:bg-purple-50"
                >
                  <span className="font-medium">{msg.sender}:</span> {msg.body.substring(0, 60)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sender ID
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., HDFC, PAYTM"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS Body
            </label>
            <textarea
              value={smsBody}
              onChange={(e) => setSmsBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Paste payment SMS here..."
            />
          </div>

          <button
            onClick={handleSend}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
            Simulate SMS Received
          </button>
        </div>
      )}
    </div>
  );
}
