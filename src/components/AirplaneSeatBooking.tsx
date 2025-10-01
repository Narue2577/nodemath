// src/components/AirplaneSeatBooking.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useSession } from "next-auth/react";

/* eslint-disable */
interface AirplaneSeatBookingProps {
  tableHeader?: string; // This can be removed if you only use session
}

const AirplaneSeatBooking: React.FC<AirplaneSeatBookingProps> = ({ tableHeader }) => {
  const { data: session, status } = useSession();
  
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerCount, setPassengerCount] = useState(4);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookings, setBookings] = useState({});
  const [dateTimeInputs, setDateTimeInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get username from session or fallback to prop
  const username =  session?.user?.name || tableHeader || 'Guest';
  const major = 'Major' || session?.user?.field;
  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }

  // Optional: Require authentication
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mb-6 text-gray-600">Please sign in to book seats.</p>
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

  console.log("Session Data:", session);
  console.log("Using username:", username);
  console.log('Field:', session?.user?.field);
  
  // Sample airplane data with different configurations
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

  // Fetch reservations from database with better error handling
  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reservations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        // Group reservations by room
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
        // Don't show error to user for failed fetches, just use empty bookings
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      // Fallback to empty bookings if API is not available
      setBookings({});
    } finally {
      setIsLoading(false);
    }
  };

  // Load reservations when component mounts
  useEffect(() => {
    fetchReservations();
  }, []);

  // Generate seat map for an airplane
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

  // Handle seat selection
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

  // Handle removing a seat from the booking table
  const handleRemoveSeat = (seatId) => {
    setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    // Remove datetime inputs for removed seat
    setDateTimeInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[seatId];
      return newInputs;
    });
  };

  // Handle datetime input changes - Fixed validation
  const handleDateTimeChange = (seatId, field, value) => {
    setDateTimeInputs(prev => ({
      ...prev,
      [seatId]: {
        ...prev[seatId],
        [field]: value
      }
    }));
  };

  // Improved booking validation and error handling
  const validateBookingData = () => {
    if (selectedSeats.length === 0) {
      return { valid: false, message: 'Please select at least one seat.' };
    }

    if (!selectedAirplane) {
      return { valid: false, message: 'Please select a room.' };
    }

    // Check if all required fields are filled
    for (const seatId of selectedSeats) {
      const seatData = dateTimeInputs[seatId];
      
      if (!seatData) {
        return { valid: false, message: `Please fill in all fields for seat ${seatId}.` };
      }
      
      if (!seatData.dateIn || !seatData.dateOut || !seatData.peroidTime || seatData.peroidTime === 'choose') {
        return { valid: false, message: `Please complete all fields for seat ${seatId}.` };
      }

      // Validate dates
      const dateIn = new Date(seatData.dateIn);
      const dateOut = new Date(seatData.dateOut);
      
      if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
        return { valid: false, message: `Invalid date format for seat ${seatId}.` };
      }
      
      if (dateOut < dateIn) {
        return { valid: false, message: `End date must be after start date for seat ${seatId}.` };
      }
    }

    return { valid: true };
  };

  // Enhanced booking handler with better error handling
  const handleBooking = async () => {
    const validation = validateBookingData();
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setIsLoading(true);

    // Create payload with proper structure - NOW USES SESSION USERNAME
    const payload = {
      username: username, // Uses session data
      room: selectedAirplane.id,
      seats: selectedSeats.map(seatId => ({
        seat: seatId,
        date_in: dateTimeInputs[seatId].dateIn,
        date_out: dateTimeInputs[seatId].dateOut,
        peroid_time: dateTimeInputs[seatId].peroidTime,
      })),
    };

    console.log("Booking payload:", payload);

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
        setDateTimeInputs({});
        setShowBookingForm(false);
        // Refresh reservations after successful booking
        await fetchReservations();
      } else {
        // Handle specific error cases
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

  // Reset selections when airplane changes
  useEffect(() => {
    setSelectedSeats([]);
    setDateTimeInputs({});
  }, [selectedAirplane]);

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

  // Enhanced BookingTable component with better validation feedback
  const BookingTable = () => (
    <div className="p-6 mb-6 rounded-lg bg-blue-50">
      <h3 className="mb-4 text-lg font-semibold text-blue-800">Booking Summary</h3>
      
      <div className="mb-4 text-sm">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Major:</strong>{session?.user?.field || 'Not available'}</p>
        <p><strong>Room:</strong> {selectedAirplane?.name}</p>
        <p><strong>Total Seats:</strong> {selectedSeats.length}</p>
        {session?.user?.email && (
          <p><strong>Email:</strong> {session.user.email}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Seat ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Date In
              </th>  
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Date Out
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Period Time
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-b">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedSeats.map((seatId, index) => {
              const seatData = dateTimeInputs[seatId] || {};
              const isComplete = seatData.dateIn && seatData.dateOut && seatData.peroidTime && seatData.peroidTime !== 'choose';
              
              return (
                <tr key={seatId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-medium text-white bg-blue-500 border border-blue-600 rounded">
                        <Check className="w-3 h-3" />
                      </div>
                      {seatId}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input 
                      type="date" 
                      className={`px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !seatData.dateIn ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={seatData.dateIn || ''}
                      onChange={(e) => handleDateTimeChange(seatId, 'dateIn', e.target.value)}
                      required
                    /> 
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input 
                      type="date" 
                      className={`px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !seatData.dateOut ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={seatData.dateOut || ''}
                      onChange={(e) => handleDateTimeChange(seatId, 'dateOut', e.target.value)}
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <select 
                      className={`px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !seatData.peroidTime || seatData.peroidTime === 'choose' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={seatData.peroidTime || 'choose'}
                      onChange={(e) => handleDateTimeChange(seatId, 'peroidTime', e.target.value)}
                      required
                    >
                      <option value="choose">Choose your time</option>
                      <option value="9:00-12:00">9:00 - 12:00</option>
                      <option value="13:00-16:00">13:00 - 16:00</option>
                      <option value="9:00-16:00">9:00 - 16:00</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isComplete 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-yellow-800 bg-yellow-100'
                    }`}>
                      {isComplete ? 'Ready' : 'Incomplete'}
                    </span>
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
              );
            })}
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
          <h1 className="text-3xl font-bold text-gray-800">Computer Seat Booking System</h1>
          <div className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold">{username}</span>
          </div>
        </div>

        {/* Airplane Selection */}
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

        {/* Passenger Count Selection */}
        {selectedAirplane && (
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Number of Reservations: <span className="px-3 py-1 text-white bg-blue-600 rounded">{selectedSeats.length}</span>
            </h2>
          </div>
        )} 

        {/* Seat Map */}
        {selectedAirplane && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Select Seats - {selectedAirplane.name}
              </h2>
            </div>

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

        {/* Booking Table */}
        {selectedSeats.length > 0 && <BookingTable />}
      </div>
    </div>
  );
};

export default AirplaneSeatBooking;