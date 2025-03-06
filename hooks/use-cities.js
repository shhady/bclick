import { useState, useEffect } from 'react';

export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCities() {
      const data = {
        resource_id: 'b7cf8f14-64a2-4b33-8d4b-edb286fdbd37',
        limit: 1500
      };

      try {
        const response = await fetch(
          `https://data.gov.il/api/action/datastore_search?resource_id=${data.resource_id}&limit=${data.limit}`
        );
        const result = await response.json();

        if (result.success) {
          const citiesList = result.result.records
            .map(item => item['שם_ישוב'])
            .filter(city => city);
          const uniqueCities = [...new Set(citiesList)].sort();
          setCities(uniqueCities);
        } else {
          setError("Failed to fetch cities data");
        }
      } catch (error) {
        setError("Error fetching cities");
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  return { cities, loading, error };
} 