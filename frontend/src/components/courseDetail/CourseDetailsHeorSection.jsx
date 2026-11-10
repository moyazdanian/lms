"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShowPrice from "@/components/ui/ShowPrice";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { useCart } from "@/hooks/cart/useCart";
import { useRemoveFromCart } from "@/hooks/cart/useRemoveFromCart";
import { useCheckEnrollment } from "@/hooks/enrollment/useCheckEnrollment";
import { useFreeEnroll } from "@/hooks/enrollment/useFreeEnroll";
import { useUser } from "@/hooks/useUser";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  Award,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  HelpCircle,
  Loader2,
  Share2,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HiTrash } from "react-icons/hi2";
import { CoursePreview } from "./CoursePreview";
import CourseDetailsTabs from "./CourseDetailsTabs";
import { useCourseContext } from "@/contexts/CourseContext";
import { useResumeCourse } from "@/hooks/progress/useResumeCourse";

export default function CourseDetailsHeroSection() {
  const course = useCourseContext();

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { data: user } = useUser();
  const { data: cart, isPending: isGettingCart } = useCart();
  const { mutate: removeFromCart, isPending: isRemovingFromCart } =
    useRemoveFromCart();
  const { data: isEnrolled, isPending: isGettingEnrollment } =
    useCheckEnrollment(course.id);
  const { mutate: enrollFree, isPending: isEnrollingFree } = useFreeEnroll();
  const { data: resume } = useResumeCourse(course.slug);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const isInCart = cart?.cart.some((item) => item.course.id === course.id);

  // Calculate total duration
  const totalDuration =
    course.sections?.reduce((total, section) => {
      return (
        total +
        (section.lessons?.reduce((secTotal, lesson) => {
          return Math.ceil(secTotal + Number(lesson.duration) / 60 || 0);
        }, 0) || 0)
      );
    }, 0) || 0;

  const handleAddToCart = () => {
    addToCart(course.id);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(course.id);
  };

  // Same rule as the backend FreeEnrollmentService: a sale price lower than
  // the list price wins; zero means free.
  const effectivePrice =
    course?.discount_price !== null &&
    course?.discount_price !== undefined &&
    Number(course.discount_price) >= 0 &&
    Number(course.discount_price) < Number(course.price)
      ? Number(course.discount_price)
      : Number(course.price);
  const isFree = effectivePrice <= 0;

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(
      !isWishlisted
        ? "Course added to wishlist!"
        : "Course removed from wishlist!",
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `Check out this course: ${course.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };
  const description = course?.short_description;

  return (
    <div className="">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Title & Info */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Badge className="mb-4 bg-gray-900/70 dark:bg-white/20 hover:bg-gray-700/30 text-white border-0">
                {course.category_id}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-gray-800 dark:text-gray-100 mb-6 line-clamp-2">
                {course.short_description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {course.enrollments_count?.toLocaleString() || 0}+ students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>
                    {course.rating || "No Rating Yet"} (
                    {course.reviews?.length || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatDuration(totalDuration)} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Last updated: {formatDate(course.updated_at)}</span>
                </div>
              </div>

              <CourseDetailsTabs course={course} user={user} />
            </div>

            {/* Right Column - Price & Actions */}
            <div className="space-y-4 relative order-1 lg:order-2">
              <Card className="dark:bg-gray-50/10 bg-gray-200/20 backdrop-blur-sm border-gray-400/20 text-gray-800 dark:text-gray-100 lg:sticky lg:top-5">
                <CardContent className="p-6">
                  <CoursePreview course={course} />
                  {/* Price */}
                  <div className="space-y-2 mb-6 mt-6">
                    <div className="flex items-center gap-3">
                      <ShowPrice
                        price={course.price}
                        discount_price={course.discount_price}
                      />
                      {course.discount_price && !isFree && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 border-0">
                          Save{" "}
                          {Math.round(
                            ((course.price - course.discount_price) /
                              course.price) *
                              100,
                          )}
                          %
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {(isGettingCart ||
                      isRemovingFromCart ||
                      isGettingEnrollment) && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-white/30 dark:text-white text-gray-800 hover:bg-white/10"
                        disabled
                      >
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </Button>
                    )}

                    {!isGettingCart &&
                      !isRemovingFromCart &&
                      !isGettingEnrollment && (
                        <>
                          {isEnrolled ? (
                            resume?.section && resume?.lesson ? (
                              <Link
                                href={`/courses/${course.slug}/${resume.section}/${resume.lesson}`}
                              >
                                <Button
                                  size="lg"
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                  Continue Learning
                                </Button>
                              </Link>
                            ) : (
                              /* Course has no lessons yet (or resume data has
                                 not loaded) — show the button disabled so the
                                 layout never links to a broken URL. */
                              <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                disabled
                              >
                                Continue Learning
                              </Button>
                            )
                          ) : isFree ? (
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              onClick={() =>
                                user
                                  ? enrollFree(course.id)
                                  : (window.location.href = "/login")
                              }
                              disabled={isEnrollingFree}
                            >
                              {isEnrollingFree ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Enrolling...
                                </>
                              ) : (
                                "Enroll for Free"
                              )}
                            </Button>
                          ) : isInCart ? (
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full border-white/30 dark:text-white text-gray-800 hover:bg-white/10"
                              onClick={handleRemoveFromCart}
                            >
                              <HiTrash className="w-4 h-4 mr-2 text-red-500" />
                              Remove from Cart
                            </Button>
                          ) : (
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full border-gray-600/10 dark:text-white text-gray-800 hover:bg-white/10 hover:shadow"
                              onClick={handleAddToCart}
                              disabled={isAddingToCart}
                            >
                              {isAddingToCart ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Adding to Cart...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                  </div>

                  {/* Features */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 dark:text-green-300 text-green-700" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4 dark:text-green-300 text-green-700" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 dark:text-green-300 text-green-700" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HelpCircle className="w-4 h-4 dark:text-green-300 text-green-700" />
                      <span>Q&A support</span>
                    </div>
                  </div>

                  {/* Share & Wishlist */}
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600/20 dark:text-white text-gray-800 hover:bg-white/10 hover:shadow"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600/20 dark:text-white text-gray-800 hover:bg-white/10 hover:shadow"
                      onClick={handleWishlistToggle}
                    >
                      {isWishlisted ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
