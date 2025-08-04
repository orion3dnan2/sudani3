import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building, Clock, Mail, Phone, DollarSign, Calendar } from "lucide-react";
import type { Job } from "@shared/schema";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesJobType = selectedJobType === "all" || job.jobType === selectedJobType;
    
    return matchesSearch && matchesCategory && matchesJobType;
  });

  const categories = [...new Set(jobs.map(j => j.category))];
  const jobTypes = [...new Set(jobs.map(j => j.jobType))];

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "full-time": "دوام كامل",
      "part-time": "دوام جزئي",
      "contract": "عقد مؤقت",
      "freelance": "عمل حر"
    };
    return labels[type] || type;
  };

  const formatExpiryDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-3"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">💼 الوظائف</h1>
            <p className="text-xl text-white/90 mb-8">
              ابحث عن فرص العمل المناسبة لك
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن الوظائف أو الشركات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-12 py-3 rounded-full text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">التخصصات</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full"
                  size="sm"
                >
                  جميع التخصصات
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">نوع العمل</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedJobType === "all" ? "default" : "outline"}
                  onClick={() => setSelectedJobType("all")}
                  className="rounded-full"
                  size="sm"
                >
                  جميع الأنواع
                </Button>
                {jobTypes.map((jobType) => (
                  <Button
                    key={jobType}
                    variant={selectedJobType === jobType ? "default" : "outline"}
                    onClick={() => setSelectedJobType(jobType)}
                    className="rounded-full"
                    size="sm"
                  >
                    {getJobTypeLabel(jobType)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          تم العثور على {filteredJobs.length} وظيفة
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لم يتم العثور على وظائف
            </h3>
            <p className="text-gray-600">
              جرب البحث بكلمات مختلفة أو اختر تخصص آخر
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{job.company}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {job.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="border-purple-300 text-purple-700"
                      >
                        {getJobTypeLabel(job.jobType)}
                      </Badge>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-3 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>

                  {/* Salary */}
                  {job.salary && (
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">{job.salary}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">المتطلبات:</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>

                  {/* Benefits */}
                  {job.benefits && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-1">المزايا:</h4>
                      <p className="text-sm text-green-700">
                        {job.benefits}
                      </p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{job.contactEmail}</span>
                      </div>
                      {job.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{job.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    {job.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>ينتهي في: {formatExpiryDate(job.expiresAt)}</span>
                      </div>
                    )}

                    {/* Apply Button */}
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // Open email client or navigate to application page
                        window.location.href = `mailto:${job.contactEmail}?subject=التقديم على وظيفة ${job.title}&body=السلام عليكم،%0D%0A%0D%0Aأرغب في التقديم على وظيفة ${job.title} في شركة ${job.company}.%0D%0A%0D%0Aشكراً لكم`;
                      }}
                    >
                      تقديم طلب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}