'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Wallet, QrCode, X, Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Add type declaration for window.civic
declare global {
  interface Window {
    civic?: {
      wallet?: {
        getWallet: () => Promise<{
          address: string;
          balance: string;
        }>;
      };
    };
  }
}

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  maxTickets: number;
  soldTickets: number;
  image: string;
  organizer: string;
}

interface UserWallet {
  address: string;
  balance: string;
}

interface PurchaseStatus {
  success: boolean;
  ticketHash?: string;
  transactionHash?: string;
  error?: string;
}

// Mock events data - replace with your actual data source
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Tech Conference 2025",
    description: "Annual technology conference featuring the latest innovations",
    date: "2025-07-15",
    time: "09:00 AM",
    location: "Convention Center, Chennai",
    price: "0.05", // in ETH
    maxTickets: 50,
    soldTickets: 12,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
    organizer: "Tech Community"
  },
  {
    id: 2,
    name: "Blockchain Summit",
    description: "Deep dive into blockchain technology and cryptocurrency",
    date: "2025-08-20",
    time: "10:00 AM",
    location: "Business Hub, Mumbai",
    price: "0.08",
    maxTickets: 55,
    soldTickets: 23,
    image: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=400&h=250&fit=crop",
    organizer: "Crypto India"
  },
  {
    id: 3,
    name: "AI Workshop",
    description: "Hands-on workshop on artificial intelligence and machine learning",
    date: "2025-09-10",
    time: "02:00 PM",
    location: "Tech Park, Bangalore",
    price: "0.03",
    maxTickets: 30,
    soldTickets: 8,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
    organizer: "AI Society"
  }
];

const EventsPage = () => {
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(null);
  const router = useRouter();

  // Replace with your actual MetaMask wallet address for testing
  const EVENT_OWNER_WALLET = "0x742E9D9B1E2A4E7B8F3C2A1D9E8F7B6A5C4D3E2F1";

  useEffect(() => {
    // Initialize Civic wallet connection
    initializeCivicWallet();
  }, []);

  const initializeCivicWallet = async () => {
    try {
      // Mock civic wallet integration - replace with actual Civic SDK
      if (window.civic?.wallet) {
        const wallet = await window.civic.wallet.getWallet();
        setUserWallet({
          address: wallet.address,
          balance: wallet.balance
        });
      } else {
        // Fallback for testing
        setUserWallet({
          address: "0x1234567890abcdef1234567890abcdef12345678",
          balance: "1.234"
        });
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const generateUniqueHash = (eventId: number, userAddress: string, timestamp: number) => {
    const data = `${eventId}-${userAddress}-${timestamp}-${Math.random()}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  };

  const handleBuyTicket = (event: Event) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
    setPurchaseStatus(null);
  };

  const generateQRCodeData = (event: Event) => {
    // QR code data for payment
    const paymentData = {
      to: EVENT_OWNER_WALLET,
      value: event.price,
      gas: "21000",
      network: "sepolia"
    };
    return JSON.stringify(paymentData);
  };

  const processPayment = async () => {
    if (!selectedEvent || !userWallet) return;

    setIsProcessing(true);
    
    try {
      // Generate unique hash for the ticket
      const uniqueHash = generateUniqueHash(
        selectedEvent.id, 
        userWallet.address, 
        Date.now()
      );

      // Mock payment process - replace with actual Civic wallet transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock smart contract interaction
      const contractAddress = "0x..."; // Your deployed contract address
      const ticketData = {
        eventId: selectedEvent.id,
        uniqueHash: uniqueHash,
        purchaser: userWallet.address,
        timestamp: Date.now()
      };

      // Update local state (replace with actual blockchain transaction)
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, soldTickets: event.soldTickets + 1 }
            : event
        )
      );

      setPurchaseStatus({
        success: true,
        ticketHash: uniqueHash,
        transactionHash: "0x" + Math.random().toString(16).substring(2, 66)
      });

    } catch (error) {
      console.error('Payment failed:', error instanceof Error ? error.message : 'Unknown error');
      setPurchaseStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentModal = () => {
    if (!showPaymentModal || !selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Purchase Ticket</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-lg">{selectedEvent.name}</h4>
              <p className="text-gray-600 mb-2">{selectedEvent.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {selectedEvent.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {selectedEvent.time}
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-blue-600">
                {selectedEvent.price} ETH
              </div>
            </div>

            {!purchaseStatus && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <QrCode size={20} />
                    Payment QR Code
                  </h5>
                  <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
                    <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                      <QrCode size={48} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan with your Civic wallet to pay
                    </p>
                    <div className="mt-2 text-xs text-gray-500 break-all">
                      To: {EVENT_OWNER_WALLET}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 break-all">
                      Amount: {selectedEvent.price} ETH
                    </div>
                    <div className="mt-2 text-xs text-gray-500 break-all">
                      Network: Sepolia
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h6 className="font-semibold text-blue-800 mb-2">Your Wallet</h6>
                  <div className="text-sm text-blue-700">
                    <div>Address: {userWallet?.address}</div>
                    <div>Balance: {userWallet?.balance} ETH</div>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Wallet size={20} />
                      Pay with Civic Wallet
                    </>
                  )}
                </button>
              </>
            )}

            {purchaseStatus && (
              <div className={`p-4 rounded-lg ${purchaseStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {purchaseStatus.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-800 mb-3">
                      <Check size={24} />
                      <h4 className="font-semibold">Payment Successful!</h4>
                    </div>
                    <div className="text-sm text-green-700 space-y-2">
                      <div>
                        <strong>Ticket Hash:</strong> 
                        <code className="bg-green-100 px-2 py-1 rounded ml-2">
                          {purchaseStatus.ticketHash}
                        </code>
                      </div>
                      <div>
                        <strong>Transaction:</strong> 
                        <code className="bg-green-100 px-2 py-1 rounded ml-2 text-xs">
                          {purchaseStatus.transactionHash}
                        </code>
                      </div>
                      <p className="mt-3 text-green-600">
                        Your ticket has been minted as an NFT and pushed to the Ethereum network!
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-red-800">
                    <h4 className="font-semibold mb-2">Payment Failed</h4>
                    <p className="text-sm">{purchaseStatus.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-1">Discover and book tickets for exciting events</p>
            </div>
            {userWallet && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-blue-700">
                  <div className="font-semibold">Wallet Connected</div>
                  <div className="text-xs">{userWallet.address.substring(0, 10)}...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{event.price} ETH</div>
                    <div className="text-xs text-gray-500">per ticket</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{event.maxTickets - event.soldTickets} of {event.maxTickets} tickets available</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Tickets Sold</span>
                    <span>{event.soldTickets}/{event.maxTickets}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(event.soldTickets / event.maxTickets) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyTicket(event)}
                  disabled={event.soldTickets >= event.maxTickets}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {event.soldTickets >= event.maxTickets ? 'Sold Out' : 'Buy Now'}
                </button>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  Organized by {event.organizer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PaymentModal />
    </div>
  );
};

export default EventsPage; 