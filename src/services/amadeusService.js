const axios = require('axios');
require('dotenv').config();

class AmadeusService {
    constructor() {
        this.baseURL = 'https://test.api.amadeus.com/v1';
        this.authURL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
        this.clientId = process.env.AMADEUS_CLIENT_ID;
        this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiration = null;
        
        console.log('AmadeusService initialized with:', {
            baseURL: this.baseURL,
            authURL: this.authURL,
            clientId: this.clientId,
            clientSecret: this.clientSecret ? '***' : 'not set'
        });
    }

    async getAccessToken() {
        try {
            if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
                console.log('Using cached access token');
                return this.accessToken;
            }

            console.log('Requesting new access token...');
            const data = new URLSearchParams();
            data.append('grant_type', 'client_credentials');
            data.append('client_id', this.clientId);
            data.append('client_secret', this.clientSecret);

            console.log('Token request URL:', this.authURL);
            const response = await axios.post(this.authURL, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('Token response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', {
                message: error.message,
                response: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                }
            });
            throw error;
        }
    }

    async searchAirports(keyword) {
        try {
            console.log('Searching airports with keyword:', keyword);
            const token = await this.getAccessToken();
            
            const response = await axios.get(`${this.baseURL}/reference-data/locations`, {
                params: {
                    keyword,
                    subType: 'AIRPORT',
                    'page[limit]': 10
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Amadeus response:', response.data);
            return response.data.data.map(location => ({
                code: location.iataCode,
                name: location.name,
                city: location.address?.cityName || location.name,
                country: location.address?.countryName
            }));
        } catch (error) {
            console.error('Error searching airports:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    params: error.config?.params
                }
            });
            throw error;
        }
    }

    async searchAirlines(keyword) {
        try {
            console.log('Searching airlines with keyword:', keyword);
            const token = await this.getAccessToken();
            
            const response = await axios.get(`https://test.api.amadeus.com/v2/reference-data/airlines`, {
                params: {
                    airlineCodes: keyword.toUpperCase()
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Amadeus response:', response.data);
            return response.data.data.map(airline => ({
                code: airline.iataCode,
                name: airline.businessName || airline.commonName,
                fullName: airline.commonName
            }));
        } catch (error) {
            console.error('Error searching airlines:', error.response?.data || error.message);
            throw error;
        }
    }

    async searchFlights(params) {
        try {
            const token = await this.getAccessToken();
            
            // Préparer les paramètres de recherche
            const searchParams = {
                originLocationCode: params.departureAirport,
                destinationLocationCode: params.arrivalAirport,
                departureDate: params.departureDate,
                adults: params.passengers?.adults || 1,
                max: 50  // Limiter à 50 résultats
            };

            // Ajouter les paramètres optionnels s'ils sont présents
            if (params.returnDate) {
                searchParams.returnDate = params.returnDate;
            }
            if (params.cabinClass) {
                searchParams.travelClass = params.cabinClass.toUpperCase();
            }
            if (params.nonStop !== undefined) {
                searchParams.nonStop = params.nonStop;
            }

            console.log('Searching flights with params:', searchParams);
            console.log('Using token:', token);

            const response = await axios.get(
                `https://test.api.amadeus.com/v2/shopping/flight-offers`,
                {
                    params: searchParams,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Flight search response:', {
                status: response.status,
                data: response.data
            });

            return response.data;
        } catch (error) {
            console.error('Error searching flights:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    params: error.config?.params
                }
            });
            throw error;
        }
    }

    async confirmPrice(flightOfferId) {
        try {
            console.log('Confirming price for flight offer:', flightOfferId);
            const token = await this.getAccessToken();
            
            const response = await axios.post(
                `${this.baseURL}/shopping/flight-offers/pricing`,
                {
                    data: {
                        type: 'flight-offers-pricing',
                        flightOffers: [flightOfferId]
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data, null, 2));
            return {
                price: response.data.data.flightOffers[0].price,
                conditions: response.data.data.bookingRequirements
            };
        } catch (error) {
            console.error('Error confirming price:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            });
            throw error;
        }
    }

    async priceFlightOffer(flightOffer) {
        try {
            const token = await this.getAccessToken();
            
            const requestData = {
                data: {
                    type: "flight-offers-pricing",
                    flightOffers: [flightOffer]
                }
            };

            console.log('Pricing flight offer:', requestData);

            const response = await axios.post(
                `${this.baseURL}/shopping/flight-offers/pricing`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Pricing response:', {
                status: response.status,
                data: response.data
            });

            return response.data;
        } catch (error) {
            console.error('Error in priceFlightOffer:', error.response?.data || error.message);
            throw error;
        }
    }

    async searchCityByKeyword(keyword) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/locations/cities`, {
                params: {
                    keyword,
                    max: 1
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data.data;
        } catch (error) {
            console.error('Error searching city:', error);
            throw error;
        }
    }

    async searchHotels(cityName) {
        try {
            const token = await this.getAccessToken();
            
            // D'abord, rechercher les coordonnées de la ville
            const cities = await this.searchCityByKeyword(cityName);
            if (!cities || cities.length === 0) {
                return {
                    success: false,
                    error: 'Ville non trouvée'
                };
            }

            const city = cities[0];
            
            // Recherche des hôtels avec l'API Hotel List
            const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode`, {
                params: {
                    latitude: city.geoCode.latitude,
                    longitude: city.geoCode.longitude,
                    radius: 20,
                    radiusUnit: 'KM',
                    ratings: ['3', '4', '5'],
                    hotelSource: 'ALL'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si nous avons des hôtels, récupérons leurs offres
            if (response.data.data && response.data.data.length > 0) {
                // Prendre les 5 premiers hôtels
                const hotels = response.data.data.slice(0, 5);
                const hotelIds = hotels.map(hotel => hotel.hotelId);
                
                // Récupérer les offres pour ces hôtels
                const offersResponse = await axios.get(`https://test.api.amadeus.com/v2/shopping/hotel-offers`, {
                    params: {
                        hotelIds: hotelIds.join(',')
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Combiner les informations des hôtels avec leurs offres
                const hotelsWithOffers = hotels.map(hotel => {
                    const hotelOffers = offersResponse.data.data.find(offer => offer.hotel.hotelId === hotel.hotelId);
                    return {
                        ...hotel,
                        offers: hotelOffers ? hotelOffers.offers : []
                    };
                });

                return {
                    success: true,
                    data: hotelsWithOffers
                };
            }

            return {
                success: true,
                data: []
            };
        } catch (error) {
            console.error('Error searching hotels:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getRandomHotels() {
        try {
            // Coordonnées de quelques grandes villes
            const cities = [
                { name: 'Paris', lat: 48.8566, lon: 2.3522 },
                { name: 'London', lat: 51.5074, lon: -0.1278 },
                { name: 'New York', lat: 40.7128, lon: -74.0060 },
                { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
                { name: 'Rome', lat: 41.9028, lon: 12.4964 }
            ];
            
            const city = cities[Math.floor(Math.random() * cities.length)];
            const token = await this.getAccessToken();
            
            // Recherche des hôtels avec l'API Hotel List
            const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode`, {
                params: {
                    latitude: city.lat,
                    longitude: city.lon,
                    radius: 20,
                    radiusUnit: 'KM',
                    ratings: ['3', '4', '5'],
                    hotelSource: 'ALL'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si nous avons des hôtels, récupérons leurs offres
            if (response.data.data && response.data.data.length > 0) {
                // Prendre les 5 premiers hôtels
                const hotels = response.data.data.slice(0, 5);
                const hotelIds = hotels.map(hotel => hotel.hotelId);
                
                // Récupérer les offres pour ces hôtels
                const offersResponse = await axios.get(`https://test.api.amadeus.com/v2/shopping/hotel-offers`, {
                    params: {
                        hotelIds: hotelIds.join(',')
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Combiner les informations des hôtels avec leurs offres
                const hotelsWithOffers = hotels.map(hotel => {
                    const hotelOffers = offersResponse.data.data.find(offer => offer.hotel.hotelId === hotel.hotelId);
                    return {
                        ...hotel,
                        offers: hotelOffers ? hotelOffers.offers : []
                    };
                });

                return {
                    success: true,
                    data: hotelsWithOffers
                };
            }

            return {
                success: true,
                data: []
            };
        } catch (error) {
            console.error('Error getting random hotels:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new AmadeusService();
