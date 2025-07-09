'use client'

import { useState, useEffect } from 'react';
import { supabase, Industry, VentureCapitalist as BaseVentureCapitalist } from '@/lib/supabase';

// Extend VentureCapitalist type to include expertise_level
type VentureCapitalist = BaseVentureCapitalist & { expertise_level: string };
import { Search, Mail, MapPin, Calendar, DollarSign, User, Star, Building } from 'lucide-react';

export default function Home(){
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [vcs, setVCs] = useState<VentureCapitalist[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndustries()
  },[]);

  const fetchIndustries = async () => {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching industries:', error);
    } else {
      setIndustries(data || []);
    }
  }
  const fetchVCsByIndustry = async (industryName: string) => {
    setLoading(true)
    setSearchPerformed(true)
    
    try {
      const { data, error } = await supabase
        .from('vc_industry_specializations')
        .select(`
          *,
          industries!inner(name),
          venture_capitalists!inner(
            *,
            vc_firms(*)
          )
        `)
        .eq('industries.name', industryName)
        .order('expertise_level', { ascending: false })

      if (error) {
        console.error('Error fetching VCs:', error)
        setVCs([])
      } else {
        const vcData = data?.map(item => ({
          ...item.venture_capitalists,
          expertise_level: item.expertise_level,
          vc_firms: item.venture_capitalists.vc_firms
        })) || []
        setVCs(vcData)
      }
    } catch (error) {
      console.error('Error:', error)
      setVCs([])
    } finally {
      setLoading(false)
    }
  }
  const handleSearch = () => {
    if (selectedIndustry) {
      fetchVCsByIndustry(selectedIndustry)
    }
  }

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VC Finder</h1>
            </div>
            <p className="text-sm text-gray-600">Find specialized venture capitalists by industry</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Discover Industry-Specialized VCs
            </h2>
            <p className="text-gray-600">
              Find venture capitalists and their validated email addresses by industry specialization
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">Select an industry...</option>
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.name}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleSearch}
                disabled={!selectedIndustry || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Searching...' : 'Find VCs'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchPerformed && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedIndustry} Specialists
              </h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {vcs.length} VCs found
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for VCs...</p>
              </div>
            ) : vcs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {vcs.map((vc) => (
                  <div key={vc.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{vc.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpertiseColor(vc.expertise_level)}`}>
                            {vc.expertise_level} Expertise
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-sm">{vc.title}</span>
                          </div>
                          
                          {vc.vc_firms && vc.vc_firms.length > 0 && (
                            <div className="flex items-center text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="text-sm">{vc.vc_firms[0].name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-gray-600">
                            <Star className="h-4 w-4 mr-2" />
                            <span className="text-sm">{vc.years_experience} years experience</span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{vc.bio}</p>

                        {/* Firm Details */}
                        {vc.vc_firms && vc.vc_firms.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {vc.vc_firms[0].location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Founded {vc.vc_firms[0].founded_year}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {vc.vc_firms[0].assets_under_management} AUM
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Email</span>
                            </div>
                            <a
                              href={`mailto:${vc.email}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {vc.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No VCs found for this industry</p>
                <p className="text-gray-500 text-sm">Try selecting a different industry</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">VC Finder Platform - Connect with Industry-Specialized Venture Capitalists</p>
            <p className="text-sm">Disclaimer: This web application is built for demonstration purposes using synthetic data generated by AI. All names, contact details, and other information are entirely fictional. Any resemblance to real persons or entities is purely coincidental, and I am not responsible for any such similarities.</p>
            <br>
            </br>
            <p className="text-sm">Built with Next.js, TailwindCSS, and Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  )
}