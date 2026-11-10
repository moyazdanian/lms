import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getInstructors } from "@/lib/api/courses";
import { avatarSrc } from "@/lib/avatar";
import {
  Star,
  Users,
  BookOpen,
  Sparkles,
  MapPin,
  ChevronRight,
  Globe,
} from "lucide-react";
import InstructorsList from "./InstructorsList";


// Live API data, so never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Header Section */}
      
      {/* Instructors Grid */}
      <div className="max-w-7xl mx-auto">
        <InstructorsList instructors={instructors} />

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-stone-600 dark:to-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Want to Join as an Instructor?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Share your knowledge with thousands of eager students and grow your
            professional brand.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Apply to Teach
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Enhanced Instructor Card Component
export function InstructorCard({ instructor }) {
  return (
    <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      {/* Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-stone-600 to-gray-700"></div>

      {/* Featured Badge (Optional) */}
      {instructor.is_featured && (
        <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
          <Star className="h-3 w-3 mr-1" /> Featured
        </Badge>
      )}

      <CardHeader className="pb-4">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Gradient Border */}
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <Image
              src={avatarSrc(instructor.avatar)}
              alt={instructor.name}
              width={120}
              height={120}
              className="relative rounded-full border-4 border-white dark:border-gray-900 object-cover"
            />
          </div>

          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {instructor.name}
          </CardTitle>

          {/* Expertise Badge */}
          <div className="mt-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
            >
              {instructor.instructor?.expertise || "Expert Instructor"}
            </Badge>
          </div>

          {/* Rating */}
          {/* <div className="flex items-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < 4
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700"
                }`}
              />
            ))}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
              4.8
            </span>
          </div> */}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {instructor.courses_count || 0}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Courses
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.floor(instructor.total_students)}+
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Students
            </div>
          </div>
        </div>

        {/* Optional: Location & Language */}
        <div className="space-y-2 mb-6">
          {instructor.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              {instructor.location}
            </div>
          )}
          {instructor.languages && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4" />
              {instructor.languages.join(", ")}
            </div>
          )}
        </div>

        {/* Short Bio/Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6">
          {instructor.instructor?.bio}
        </p>

        {/* Expertise Tags */}
        {/* <div className="flex flex-wrap gap-2 mb-6">
          {instructor.skills?.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          )) || (
            <>
              <Badge variant="outline" className="text-xs">
                Industry Expert
              </Badge>
              <Badge variant="outline" className="text-xs">
                Practical Projects
              </Badge>
              <Badge variant="outline" className="text-xs">
                Student Support
              </Badge>
            </>
          )}
        </div> */}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          className="w-full group/btn  hover:from-blue-700 hover:to-purple-700 shadow-md"
          size="lg"
        >
          <Link href={`/instructors/${instructor.id}`}>
            View Full Profile
            <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
