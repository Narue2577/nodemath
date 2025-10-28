'use client'
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Check, X, Upload, FileText, PenTool, User, Users2} from 'lucide-react';


const AirplaneSeatBooking = () => {
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingType, setBookingType] = useState(null); // 'single' or 'room'
  const [maxSeats, setMaxSeats] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookings, setBookings] = useState({});
  const [dateTimeInputs, setDateTimeInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Permit/Signature related states
  const [permitMethod, setPermitMethod] = useState('digital'); // 'digital' or 'upload'
  const [digitalSignature, setDigitalSignature] = useState('');
  const [permitName, setPermitName] = useState('');
  const [permitRole, setPermitRole] = useState('');
  const [uploadedPermit, setUploadedPermit] = useState(null);
  const [showPermitForm, setShowPermitForm] = useState(false);

  // Mock session data - replace with actual useSession
  const username = 'John Doe';
  const major = 'Computer Science';

  const airplanes = [
    {
      id: 'room601',
      name: 'Computer Room 601',
      capacity: 54,
      rows: 7,
      seatsPerRow: 8,
      unused: ['4E','5E'],
      occupied: ['1A'],
      layout: [
        { section: 'Room 601', rows: 7, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
      ]
    },
    {
      id: 'room602',
      name: 'Computer Room 602',
      capacity: 54,
      rows: 8,
      seatsPerRow: 8,
      unused: ['1A','1B','1G','1H','2A','5A','5H','6A','6H'],
      occupied: [],
      layout: [
        { section: 'Room 602', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
      ]
    },
    {
      id: 'room701',
      name: 'Computer Room 701',
      capacity: 54,
      rows: 7,
      seatsPerRow: 8,
      unused: ['4E','5E'],
      occupied: [],
      layout: [
        { section: 'Room 701', rows: 7, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
      ]
    },
    {
      id: 'room801',
      name: 'Computer Room 801',
      capacity: 55,
      rows: 8,
      seatsPerRow: 8,
      unused: ['1B','1C','1D','1E','1F','1G','1H','5E','6E'],
      occupied: [],
      layout: [
        { section: 'Room 801', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
      ]
    },
    {
      id: 'room802',
      name: 'Computer Room 802',
      capacity: 56,
      rows: 8,
      seatsPerRow: 8,
      unused: ['1A','1B','1G','1H','5A','5H', '6A','6H'],
      occupied: [],
      layout: [
        { section: 'Room 802', rows: 8, seatsPerRow: 8, seatWidth: 'A B C D   E F G H' }
      ]
    }
  ];

  // Get all available seats for a room
  const getAvailableSeats = (airplane) => {
    const allSeats = [];
    airplane.layout.forEach((section) => {
      const seatLetters = section.seatWidth.replace(/\s+/g, '').split('');
      for (let row = 1; row <= section.rows; row++) {
        seatLetters.forEach((letter) => {
          const seatId = `${row}${letter}`;
          if (!airplane.unused.includes(seatId) && !bookings[airplane.id]?.includes(seatId)) {
            allSeats.push(seatId);
          }
        });
      }
    });
    return allSeats;
  };

  // Handle booking type selection
  const handleBookingTypeSelect = (type) => {
    // Don't reset if already in this mode
    if (bookingType === type) return;
    
    setBookingType(type);
    setSelectedSeats([]);
    setDateTimeInputs({});
    
    if (type === 'room') {
      // Auto-select all available seats
      const availableSeats = getAvailableSeats(selectedAirplane);
      setSelectedSeats(availableSeats);
      setMaxSeats(availableSeats.length);
    } else {
      setMaxSeats(1); // Default to 1 for single booking
    }
  };

  // Generate seat map
  const generateSeatMap = (airplane) => {
    const seatMap = [];
    let currentRow = 1;

    airplane.layout.forEach((section) => {
      for (let row = 0; row < section.rows; row++) {
        const rowSeats = [];
        const seatLetters = section.seatWidth.replace(/\s+/g, '').split('');
        
        seatLetters.forEach((letter) => {
          const seatId = `${currentRow}${letter}`;
          rowSeats.push({
            id: seatId,
            row: currentRow,
            letter: letter,
            occupied: bookings[airplane.id]?.includes(seatId) || false,
            unused: airplane.unused.includes(seatId),
            selected: selectedSeats.includes(seatId), 
          });
        });
        
        seatMap.push({
          rowNumber: currentRow,
          seats: rowSeats,
          section: section.section,
          seatWidth: section.seatWidth
        });
        currentRow++;
      }
    });

    return seatMap;
  };

  // Handle seat click
  const handleSeatClick = (seatId, occupied, unused) => {
    if (occupied || unused || bookingType === 'room') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < maxSeats) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert(`You can only select up to ${maxSeats} seats for single booking.`);
      }
    }
  };

  // Handle removing a seat
  const handleRemoveSeat = (seatId) => {
    if (bookingType === 'room') return; // Can't remove seats in room booking
    setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    setDateTimeInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[seatId];
      return newInputs;
    });
  };

  // Handle datetime input changes
  const handleDateTimeChange = (seatId, field, value) => {
    if (bookingType === 'room') {
      // Apply to all seats in room booking
      const newInputs = {};
      selectedSeats.forEach(seat => {
        newInputs[seat] = {
          ...dateTimeInputs[seat],
          [field]: value
        };
      });
      setDateTimeInputs(newInputs);
    } else {
      setDateTimeInputs(prev => ({
        ...prev,
        [seatId]: {
          ...prev[seatId],
          [field]: value
        }
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedPermit(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  // Validate permit
  const validatePermit = () => {
    if (permitMethod === 'digital') {
      if (!digitalSignature.trim()) {
        return { valid: false, message: 'Please provide your digital signature.' };
      }
      if (!permitName.trim()) {
        return { valid: false, message: 'Please enter permit holder name.' };
      }
      if (!permitRole.trim()) {
        return { valid: false, message: 'Please enter permit holder role.' };
      }
      if (digitalSignature.length < 3) {
        return { valid: false, message: 'Signature must be at least 3 characters.' };
      }
    } else {
      if (!uploadedPermit) {
        return { valid: false, message: 'Please upload a permit document (PDF).' };
      }
    }
    return { valid: true };
  };

  // Validate booking data
  const validateBookingData = () => {
    if (selectedSeats.length === 0) {
      return { valid: false, message: 'Please select at least one seat.' };
    }

    if (!selectedAirplane) {
      return { valid: false, message: 'Please select a room.' };
    }

    if (!bookingType) {
      return { valid: false, message: 'Please select booking type (Single or Room).' };
    }

    // Check dates for room booking
    if (bookingType === 'room') {
      const firstSeat = selectedSeats[0];
      const seatData = dateTimeInputs[firstSeat];
      
      if (!seatData || !seatData.dateIn || !seatData.dateOut || !seatData.periodTime || seatData.periodTime === 'choose') {
        return { valid: false, message: 'Please fill in all booking details.' };
      }
    } else {
      // Check all seats for single booking
      for (const seatId of selectedSeats) {
        const seatData = dateTimeInputs[seatId];
        
        if (!seatData || !seatData.dateIn || !seatData.dateOut || !seatData.periodTime || seatData.periodTime === 'choose') {
          return { valid: false, message: `Please complete all fields for seat ${seatId}.` };
        }
      }
    }

    return { valid: true };
  };

  // Proceed to permit form
  const proceedToPermit = () => {
    const validation = validateBookingData();
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setShowPermitForm(true);
  };

  // Handle final booking with permit
  const handleFinalBooking = async () => {
    const permitValidation = validatePermit();
    
    if (!permitValidation.valid) {
      alert(permitValidation.message);
      return;
    }

    setIsLoading(true);

    // Create payload
    const payload = {
      username: username,
      major: major,
      room: selectedAirplane.id,
      bookingType: bookingType,
      seats: selectedSeats.map(seatId => ({
        seat: seatId,
        date_in: dateTimeInputs[seatId].dateIn,
        date_out: dateTimeInputs[seatId].dateOut,
        period_time: dateTimeInputs[seatId].periodTime,
      })),
      permit: permitMethod === 'digital' ? {
        type: 'digital',
        signature: digitalSignature,
        permitName: permitName,
        permitRole: permitRole,
        timestamp: new Date().toISOString()
      } : {
        type: 'uploaded',
        fileName: uploadedPermit.name,
        fileSize: uploadedPermit.size
      }
    };

    console.log("Booking payload:", payload);

    // Simulate API call
    try {
      // In production, send to your API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Successfully booked ${selectedSeats.length} seat(s) in ${selectedAirplane.name}!\n\nPermit ${permitMethod === 'digital' ? 'signed' : 'uploaded'} by: ${permitMethod === 'digital' ? permitName : 'Document uploaded'}`);
      
      // Reset form
      setSelectedSeats([]);
      setDateTimeInputs({});
      setShowPermitForm(false);
      setBookingType(null);
      setDigitalSignature('');
      setPermitName('');
      setPermitRole('');
      setUploadedPermit(null);
      setSelectedAirplane(null);
    } catch (error) {
      console.error('Booking error:', error);
      alert(`An error occurred while booking: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render seat
  const renderSeat = (seat) => {
    const baseClasses = "w-8 h-8 border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200";
    
    let seatClasses = baseClasses;
    
    if (seat.unused) {
      seatClasses += " bg-black border-gray-800 text-white cursor-not-allowed";
    } else if (seat.occupied) {
      seatClasses += " bg-red-500 border-red-600 text-white cursor-not-allowed";
    } else if (seat.selected) {
      seatClasses += " bg-blue-500 border-blue-600 text-white transform scale-110";
    } else {
      seatClasses += bookingType === 'room' ? " bg-gray-200 border-gray-400 cursor-not-allowed" : " bg-green-100 border-green-400 text-green-800 hover:bg-green-200";
    }

    return (
      <div
        key={seat.id}
        className={seatClasses}
        onClick={() => handleSeatClick(seat.id, seat.occupied, seat.unused)}
        title={`Seat ${seat.id}`}
      >
        {seat.unused ? 'X' : seat.occupied ? <X className="w-3 h-3" /> : seat.selected ? <Check className="w-3 h-3" /> : seat.letter}
      </div>
    );
  };

  // Render seat row
  const renderSeatRow = (row) => {
    const seatElements = [];
    const seatPattern = row.seatWidth.split('');
    let seatIndex = 0;

    seatPattern.forEach((char, index) => {
      if (char === ' ') {
        seatElements.push(<div key={`space-${index}`} className="w-4" />);
      } else {
        seatElements.push(renderSeat(row.seats[seatIndex]));
        seatIndex++;
      }
    });

    return (
      <div key={row.rowNumber} className="flex items-center justify-center mb-2 space-x-1">
        <div className="w-8 text-sm font-medium text-center text-gray-600">
          {row.rowNumber}
        </div>
        <div className="flex space-x-1">
          {seatElements}
        </div>
      </div>
    );
  };

  // Booking Table
  const BookingTable = () => (
    <div className="p-6 mb-6 rounded-lg bg-blue-50">
      {/* Booking Type Selection - Now inside booking table */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-800">Booking Summary</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleBookingTypeSelect('single')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              bookingType === 'single'
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Single</span>
            </div>
          </button>
          <button
            onClick={() => handleBookingTypeSelect('room')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              bookingType === 'room'
                ? 'border-purple-500 bg-purple-500 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              <span className="font-medium">Room</span>
            </div>
          </button>
        </div>
      </div>

      {/* Number of seats selector for single booking */}
      {bookingType === 'single' && (
        <div className="flex items-center gap-3 p-3 mb-4 border-blue-300 rounded-lg">
          <span className="font-medium text-gray-700">Number of seats:</span>
          <select
            value={maxSeats}
            onChange={(e) => {
              const newMax = parseInt(e.target.value);
              setMaxSeats(newMax);
              if (selectedSeats.length > newMax) {
                setSelectedSeats(selectedSeats.slice(0, newMax));
              }
            }}
            className="px-3 py-2 font-medium text-blue-700 bg-blue-50 border-2 border-blue-300 rounded-lg"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'seat' : 'seats'}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Major:</strong> {major}</p>
          <p><strong>Room:</strong> {selectedAirplane?.name}</p>
        </div>
        <div>
          <p><strong>Booking Type:</strong> <span className="px-2 py-1 text-black">{bookingType === 'room' ? ' Room' : 'Single'}</span></p>
          <p><strong>Total Seats:</strong> {selectedSeats.length}</p>
        </div>
      </div>

      {bookingType === 'room' ? (
        // Single form for entire room
        <div className="p-4 mb-4 bg-white border border-gray-300 rounded-lg">
          <h4 className="mb-3 font-semibold text-gray-700">Room Booking Details ({selectedSeats.length} seats)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Date In</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateTimeInputs[selectedSeats[0]]?.dateIn || ''}
                onChange={(e) => handleDateTimeChange(selectedSeats[0], 'dateIn', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Date Out</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateTimeInputs[selectedSeats[0]]?.dateOut || ''}
                onChange={(e) => handleDateTimeChange(selectedSeats[0], 'dateOut', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Period Time</label>
              <select 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateTimeInputs[selectedSeats[0]]?.periodTime || 'choose'}
                onChange={(e) => handleDateTimeChange(selectedSeats[0], 'periodTime', e.target.value)}
                required
              >
                <option value="choose">Choose time</option>
                <option value="9:00-12:00">9:00 - 12:00</option>
                <option value="13:00-16:00">13:00 - 16:00</option>
                <option value="9:00-16:00">9:00 - 16:00</option>
              </select>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <p>Selected seats: {selectedSeats.join(', ')}</p>
          </div>
        </div>
      ) : (
        // Individual seat table
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase border-b">Seat ID</th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase border-b">Date In</th>  
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase border-b">Date Out</th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase border-b">Period Time</th>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase border-b">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedSeats.map((seatId) => {
                const seatData = dateTimeInputs[seatId] || {};
                
                return (
                  <tr key={seatId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{seatId}</td>
                    <td className="px-4 py-3 text-sm">
                      <input 
                        type="date" 
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={seatData.dateIn || ''}
                        onChange={(e) => handleDateTimeChange(seatId, 'dateIn', e.target.value)}
                        required
                      /> 
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input 
                        type="date" 
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={seatData.dateOut || ''}
                        onChange={(e) => handleDateTimeChange(seatId, 'dateOut', e.target.value)}
                        required
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select 
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={seatData.periodTime || 'choose'}
                        onChange={(e) => handleDateTimeChange(seatId, 'periodTime', e.target.value)}
                        required
                      >
                        <option value="choose">Choose time</option>
                        <option value="9:00-12:00">9:00 - 12:00</option>
                        <option value="13:00-16:00">13:00 - 16:00</option>
                        <option value="9:00-16:00">9:00 - 16:00</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleRemoveSeat(seatId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={proceedToPermit}
        className="px-6 py-2 mt-4 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Proceed to Permit Authorization
      </button>
    </div>
  );

  // Permit Form
  const PermitForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-screen p-6 overflow-y-auto bg-white rounded-lg shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Permit Authorization Required</h2>
        
        {/* Method Selection - HIGHLIGHTED */}
        <div className="p-4 mb-6 border-4 border-yellow-400 rounded-lg bg-yellow-50">
          <h3 className="mb-4 text-lg font-semibold text-yellow-900">⚡ RECOMMENDED: Choose Authorization Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPermitMethod('digital')}
              className={`p-4 border-2 rounded-lg transition-all ${
                permitMethod === 'digital' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <PenTool className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">Digital Signature</h4>
              <p className="text-xs text-gray-600">✅ Faster & Recommended</p>
            </button>
            <button
              onClick={() => setPermitMethod('upload')}
              className={`p-4 border-2 rounded-lg transition-all ${
                permitMethod === 'upload' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Upload PDF</h4>
              <p className="text-xs text-gray-600">For formal documents</p>
            </button>
          </div>
        </div>

        {/* Digital Signature Form */}
        {permitMethod === 'digital' && (
          <div className="p-4 mb-6 border border-green-300 rounded-lg bg-green-50">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-green-800">
              <PenTool className="w-5 h-5 mr-2" />
              Digital Signature (Recommended)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Permit Holder Name *
                </label>
                <input
                  type="text"
                  value={permitName}
                  onChange={(e) => setPermitName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Role/Position *
                </label>
                <input
                  type="text"
                  value={permitRole}
                  onChange={(e) => setPermitRole(e.target.value)}
                  placeholder="e.g., Department Head, Supervisor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Digital Signature * (Type your name)
                </label>
                <input
                  type="text"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Type your signature here"
                  className="w-full px-4 py-3 text-2xl italic font-bold border-2 border-gray-400 rounded-lg font-serif focus:ring-2 focus:ring-green-500"
                  style={{ fontFamily: 'Brush Script MT, cursive' }}
                  required
                />
                {digitalSignature && (
                  <p className="mt-2 text-sm text-green-600">✓ Signature preview: <span className="text-2xl italic font-bold font-serif">{digitalSignature}</span></p>
                )}
              </div>
              <div className="p-3 text-sm text-green-800 bg-green-100 rounded">
                <p className="font-semibold">✅ Why Digital Signature?</p>
                <ul className="mt-2 ml-4 text-xs list-disc">
                  <li>Instant processing</li>
                  <li>Automatic timestamp & audit trail</li>
                  <li>No file size limits</li>
                  <li>Mobile-friendly</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PDF Upload Form */}
        {permitMethod === 'upload' && (
          <div className="p-4 mb-6 border border-blue-300 rounded-lg bg-blue-50">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-blue-800">
              <FileText className="w-5 h-5 mr-2" />
              Upload Permit Document (PDF)
            </h3>
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full"
                  id="permit-upload"
                />
                <label htmlFor="permit-upload" className="block mt-2 text-sm text-center text-gray-600 cursor-pointer">
                  {uploadedPermit ? (
                    <span className="text-green-600">✓ {uploadedPermit.name} ({(uploadedPermit.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    <span>Click to upload PDF (Max 5MB)</span>
                  )}
                </label>
              </div>
              <div className="p-3 text-sm text-blue-800 bg-blue-100 rounded">
                <p className="font-semibold">📄 PDF Upload Guidelines:</p>
                <ul className="mt-2 ml-4 text-xs list-disc">
                  <li>Must be signed permit document</li>
                  <li>Maximum file size: 5MB</li>
                  <li>PDF format only</li>
                  <li>Ensure document is legible</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowPermitForm(false)}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleFinalBooking}
            disabled={isLoading}
            className={`px-6 py-2 font-medium text-white rounded-lg ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Processing...' : '✓ Confirm Booking with Permit'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl min-h-screen p-6 mx-auto bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Computer Room Booking System</h1>

        {/* Room Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {airplanes.map((airplane) => (
              <div
                key={airplane.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAirplane?.id === airplane.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => {
                  setSelectedAirplane(airplane);
                  setBookingType(null);
                  setSelectedSeats([]);
                }}
              >
                <h3 className="mb-2 text-lg font-bold text-center text-gray-800">{airplane.name}</h3>
                <p className="text-sm text-center text-gray-600">Capacity: {airplane.capacity}</p>
                <p className="text-sm text-center text-gray-600">
                  Available: {airplane.capacity - airplane.unused.length - (bookings[airplane.id]?.length || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>



        {/* Seat Map */}
        {selectedAirplane && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
             {/*  <h2 className="text-xl font-semibold text-gray-700">
                {bookingType === 'room' ? 'Room Layout Preview' : bookingType === 'single' ? 'Select Your Seats' : 'Select Room and Booking Type'}
              </h2> */}
              {bookingType && (
                <div className="text-sm">
                  <span className="font-semibold">Selected:</span> {selectedSeats.length} {bookingType === 'room' ? `/ ${getAvailableSeats(selectedAirplane).length}` : `/ ${maxSeats}`}
                </div>
              )}
            </div>

            {bookingType === 'room' && (
              <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded">
                ✓ All {selectedSeats.length} available seats have been automatically selected for room booking
              </div>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-red-600"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black border-2 border-gray-800"></div>
                <span>Not Available</span>
              </div>
            </div>

            {/* Seat Map */}
            <div className="p-6 overflow-y-auto bg-gray-100 rounded-lg max-h-96">
              <div className="flex flex-col items-center">
                {generateSeatMap(selectedAirplane).map(renderSeatRow)}
              </div>
            </div>
          </div>
        )}

        {/* Booking Table - Always show when airplane selected */}
        {selectedAirplane && <BookingTable />}

        {/* Permit Form Modal */}
        {showPermitForm && <PermitForm />}
      </div>
    </div>
  );
};

export default AirplaneSeatBooking;