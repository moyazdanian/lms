import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Video } from "lucide-react";
import { AVATAR_PLACEHOLDER, avatarSrc } from "@/lib/avatar";

export default function CourseDetailsInstructorTab({ instructor }) {
  const defaultInstructor = {
    name: "Instructor",
    avatar: AVATAR_PLACEHOLDER,
    expertise: "Expert Instructor",
    bio: "Experienced professional with years of industry experience and a passion for teaching. Dedicated to helping students succeed in their learning journey.",
    rating: 4.9,
    studentsCount: "25,000+",
    coursesCount: 15,
    yearsExperience: 10,
    teachingStyle: [
      "Practical Projects",
      "Clear Explanations",
      "Student Support",
      "Real-world Examples"
    ]
  };

  const data = instructor || defaultInstructor;

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="sticky top-6">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage src={avatarSrc(data.avatar)} alt={data.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {data.name?.charAt(0) || "I"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{data.name}</h3>
                <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {data.expertise}
                </Badge>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{data.rating} Instructor Rating</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span>{data.studentsCount}+ Students</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Video className="w-4 h-4 text-green-500" />
                    <span>{data.coursesCount} Courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-4">About the Instructor</h4>
              <p className="text-gray-700 dark:text-gray-300">{data.bio}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.yearsExperience}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Years Experience
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data.studentsCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Students Taught
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.rating}/5
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Rating
                </div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {data.coursesCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Courses Created
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Teaching Style</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Focuses on practical, hands-on learning with real-world projects. 
                Believes in making complex concepts simple and accessible to everyone.
              </p>
              {/* <div className="flex flex-wrap gap-2">
                {data.teachingStyle.map((style, index) => (
                  <Badge key={index} variant="outline">{style}</Badge>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}