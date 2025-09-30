// src/components/AirplaneSeatBookingAdmin.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AirplaneSeatBookingProps {
  tableHeader?: string;
}

const AirplaneSeatBookingAdmin: React.FC<AirplaneSeatBookingProps> = ({ tableHeader }) => {
  // ⭐ FIXED: Move useSession to top
  const { data: session, status } = useSession();
  
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(4);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookings, setBookings] = useState({});
  
  // Bulk datetime input for all seats
  const [bulkDateTimeInputs, setBulkDateTimeInputs] = useState({
    dateIn: '',
    dateOut: '',
    peroidTime: 'choose'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // ⭐ FIXED: Get username from session first, then fallback
  const username = session?.user?.email || session?.user?.name || tableHeader || 'Staff';

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }

  // Optional: Require authentication for admin
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Admin Access Required</h2>
          <p className="mb-6 text-gray-600">Please sign in to access the admin booking system.</p>
          <button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  console.log("Admin Session:", session);
  console.log("Admin Username:", username);

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

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reservations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const reservationsByRoom = {};
        if (data.reservations && Array.isArray(data.reservations)) {
          data.reservations.forEach(reservation => {
            if (reservation.room && reservation.seat) {
              if (!reservationsByRoom[reservation.room]) {
                reservationsByRoom[reservation.room] = [];
              }
              reservationsByRoom[reservation.room].push(reservation.seat);
            }
          });
        }
        setBookings(reservationsByRoom);
      } else {
        console.warn('Failed to fetch reservations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setBookings({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

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

  const handleSeatClick = (seatId, occupied, unused) => {
    if (occupied || unused) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < passengerCount) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        setSelectedSeats([...selectedSeats.slice(1), seatId]);
      }
    }
  };

  const handleRemoveSeat = (seatId) => {
    setSelectedSeats(selectedSeats.filter(id => id !== seatId));
  };

  const handleBulkDateTimeChange = (field, value) => {
    setBulkDateTimeInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateBookingData = () => {
    if (selectedSeats.length === 0) {
      return { valid: false, message: 'Please select at least one seat.' };
    }

    if (!selectedAirplane) {
      return { valid: false, message: 'Please select a room.' };
    }

    if (!bulkDateTimeInputs.dateIn || !bulkDateTimeInputs.dateOut || !bulkDateTimeInputs.peroidTime || bulkDateTimeInputs.peroidTime === 'choose') {
      return { valid: false, message: 'Please complete all date and time fields.' };
    }

    const dateIn = new Date(bulkDateTimeInputs.dateIn);
    const dateOut = new Date(bulkDateTimeInputs.dateOut);
    
    if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
      return { valid: false, message: 'Invalid date format.' };
    }
    
    if (dateOut < dateIn) {
      return { valid: false, message: 'End date must be after start date.' };
    }

    return { valid: true };
  };

  const handleBooking = async () => {
    const validation = validateBookingData();
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setIsLoading(true);

    // ⭐ FIXED: Now uses session username
    const payload = {
      username: username,
      room: selectedAirplane.id,
      seats: selectedSeats.map(seatId => ({
        seat: seatId,
        date_in: bulkDateTimeInputs.dateIn,
        date_out: bulkDateTimeInputs.dateOut,
        peroid_time: bulkDateTimeInputs.peroidTime,
      })),
    };

    console.log("Admin booking payload:", payload);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        alert(`Successfully booked ${selectedSeats.length} seat(s) in ${selectedAirplane.name}!`);
        setSelectedSeats([]);
        setBulkDateTimeInputs({ dateIn: '', dateOut: '', peroidTime: 'choose' });
        setShowBookingForm(false);
        await fetchReservations();
      } else {
        const errorMessage = responseData?.message || responseData?.error || 'Failed to book seats';
        console.error('Booking failed:', response.status, errorMessage);
        alert(`Booking failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network or parsing error:', error);
      alert(`An error occurred while booking: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-select all available seats when room changes
  useEffect(() => {
    if (selectedAirplane) {
      const allSeats = [];
      let currentRow = 1;
      
      selectedAirplane.layout.forEach((section) => {
        for (let row = 0; row < section.rows; row++) {
          const seatLetters = section.seatWidth.replace(/\s+/g, '').split('');
          seatLetters.forEach((letter) => {
            const seatId = `${currentRow}${letter}`;
            if (!selectedAirplane.unused.includes(seatId) && !bookings[selectedAirplane.id]?.includes(seatId)) {
              allSeats.push(seatId);
            }
          });
          currentRow++;
        }
      });
      
      setSelectedSeats(allSeats);
    } else {
      setSelectedSeats([]);
    }
    setBulkDateTimeInputs({ dateIn: '', dateOut: '', peroidTime: 'choose' });
  }, [selectedAirplane, bookings]);

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
      seatClasses += " bg-green-100 border-green-400 text-green-800 hover:bg-green-200";
    }

    return (
      <div
        key={seat.id}
        className={seatClasses}
        onClick={() => handleSeatClick(seat.id, seat.occupied, seat.unused)}
        title={`Seat ${seat.id} - ${seat.section} ${seat.unused ? '(Not Available)' : seat.occupied ? '(Occupied)' : '(Available)'}`}
      >
        {seat.unused ? 'X' : seat.occupied ? <X className="w-3 h-3 text-white" /> : seat.selected ? <Check className="w-3 h-3 text-white" /> : seat.letter}
      </div>
    );
  };

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

  // ⭐ FIXED: BookingTable now uses session username
  const BookingTable = () => (
    <div className="p-6 mb-6 rounded-lg bg-blue-50">
      <h3 className="mb-4 text-lg font-semibold text-blue-800">Booking Summary (Admin)</h3>
      
      <div className="mb-4 text-sm">
        <p><strong>Admin User:</strong> {username}</p>
        <p><strong>Room:</strong> {selectedAirplane?.name}</p>
        <p><strong>Total Seats:</strong> {selectedSeats.length}</p>
        {session?.user?.email && (
          <p><strong>Email:</strong> {session.user.email}</p>
        )}
      </div>

      {/* Bulk date/time inputs for all seats */}
      <div className="p-4 mb-4 bg-white border border-gray-300 rounded-lg">
        <h4 className="mb-3 font-semibold text-gray-700">Set Date & Time for All Seats</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Date In</label>
            <input 
              type="date" 
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !bulkDateTimeInputs.dateIn ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={bulkDateTimeInputs.dateIn}
              onChange={(e) => handleBulkDateTimeChange('dateIn', e.target.value)}
              required
            /> 
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Date Out</label>
            <input 
              type="date" 
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !bulkDateTimeInputs.dateOut ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={bulkDateTimeInputs.dateOut}
              onChange={(e) => handleBulkDateTimeChange('dateOut', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Period Time</label>
            <select 
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !bulkDateTimeInputs.peroidTime || bulkDateTimeInputs.peroidTime === 'choose' ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={bulkDateTimeInputs.peroidTime}
              onChange={(e) => handleBulkDateTimeChange('peroidTime', e.target.value)}
              required
            >
              <option value="choose">Choose your time</option>
              <option value="9:00-12:00">9:00 - 12:00</option>
              <option value="13:00-16:00">13:00 - 16:00</option>
              <option value="9:00-16:00">9:00 - 16:00</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simplified table showing just seat IDs */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Seat ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedSeats.map((seatId, index) => (
              <tr key={seatId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-medium text-white bg-blue-500 border border-blue-600 rounded">
                      <Check className="w-3 h-3" />
                    </div>
                    {seatId}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleRemoveSeat(seatId)}
                    className="text-red-600 transition-colors duration-200 hover:text-red-800"
                    title="Remove seat"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSeats.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No seats selected
        </div>
      )}

      {selectedSeats.length > 0 && (
        <button
          onClick={handleBooking}
          disabled={isLoading}
          className={`px-6 py-2 mt-4 font-medium text-white rounded-lg transition-colors duration-200 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl min-h-screen p-6 mx-auto bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin: Computer Seat Booking System</h1>
          <div className="text-sm text-gray-600">
            Admin: <span className="font-semibold">{username}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Select Room</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {airplanes.map((airplane) => (
              <div
                key={airplane.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedAirplane?.id === airplane.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedAirplane(airplane)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-center text-gray-800">{airplane.name}</h3>
                </div>
                <p className="mb-1 text-sm text-center text-gray-600">Capacity: {airplane.capacity}</p>
                <p className="mb-1 text-sm text-center text-gray-600">
                  Occupied: {isLoading ? '...' : (bookings[airplane.id]?.length || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedAirplane && (
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Number of Reservations: <span className="px-3 py-1 text-white bg-blue-600 rounded">{selectedSeats.length}</span>
            </h2>
          </div>
        )} 

        {selectedAirplane && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Select Seats - {selectedAirplane.name}
              </h2>
            </div>

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

            <div className="p-6 overflow-y-auto bg-gray-100 rounded-lg max-h-96">
              <div className="flex flex-col items-center">
                {generateSeatMap(selectedAirplane).map(renderSeatRow)}
              </div>
            </div>
          </div>
        )}

        {selectedSeats.length > 0 && <BookingTable />}
      </div>
    </div>
  );
};

export default AirplaneSeatBookingAdmin;