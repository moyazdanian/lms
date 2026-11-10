"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Formik } from "formik";
import { textSchema, YupObject } from "@/utilities/validation/ValidationSchema";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useStoreReview } from "@/hooks/reviews/useStoreReview";
// import ReviewsStats from "./ReviewsStats";
// import ReviewItem from "./ReviewItem";
// import AddReviewForm from "./AddReviewForm";

export default function CourseDetailsReviewsTab({ course, user }) {
  const [reply, setReply] = useState(null);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Add Review */}
        {user && <AddReviewForm courseId={course.id} />}

        {/* Reviews List */}
        <div className="space-y-4">
          {course.reviews?.length > 0 ? (
            course.reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                courseId={course.id}
                reply={reply}
                setReply={setReply}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-4">
                  Be the first to share your thoughts about this course!
                </p>
                {!user && (
                  <Button asChild>
                    <Link href="/login">Login to Add Review</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Stats */}
      <ReviewsStats course={course} />
    </div>
  );
}

// AddReviewForm.jsx
const AddReviewForm = ({ courseId }) => {
  const { mutate: storeCommentQuery, isPending: isSubmittingReview } =
    useStoreReview();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ rating: 5, review: "" }}
          validationSchema={YupObject({ review: textSchema })}
          onSubmit={(values, { resetForm }) => {
            storeCommentQuery({
              course_id: courseId,
              comment: values.review,
              rating: values.rating,
            });
            resetForm();
          }}
        >
          {({ errors, getFieldProps, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="text-2xl">
                        <Star className="fill-gray-300 text-gray-300 hover:fill-yellow-400 hover:text-yellow-400" />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Share your experience with this course..."
                  {...getFieldProps("review")}
                  rows={4}
                />
                {errors.review && (
                  <span className="text-red-400 text-sm">{errors.review}</span>
                )}
                <Button className="w-full" type="submit">
                  {isSubmittingReview ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

// ReviewItem.jsx
const ReviewItem = ({ review, courseId, reply, setReply }) => {
  const { mutate: storeCommentQuery, isPending: isSubmittingReview } =
    useStoreReview();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.user.avatar} />
            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{review.user.name}</h4>
                <p className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>

            <div className="flex items-center gap-4 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setReply(reply === review.id ? null : review.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Reply
              </Button>
            </div>

            {reply === review.id && (
              <div className="mt-4">
                <Formik
                  initialValues={{ review: "" }}
                  validationSchema={YupObject({ review: textSchema })}
                  onSubmit={(values, { resetForm }) => {
                    storeCommentQuery({
                      course_id: courseId,
                      comment: values.review,
                      rating: 5,
                      parent_id: review.id,
                    });
                    resetForm();
                    setReply(null);
                  }}
                >
                  {({ getFieldProps, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <Textarea
                        rows={4}
                        placeholder={`Reply to ${review.user.name}...`}
                        {...getFieldProps("review")}
                      />
                      <Button className="mt-3 w-full" type="submit">
                        {isSubmittingReview ? <Spinner /> : "Submit Reply"}
                      </Button>
                    </form>
                  )}
                </Formik>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {review.replies?.length > 0 && (
          <div className="mt-4 space-y-4">
            {review.replies.map((reply) => (
              <div key={reply.id}>
                <Separator className="my-3" />
                <div className="flex items-start gap-4 ml-10">
                  <Avatar>
                    <AvatarImage src={reply.user.avatar} />
                    <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{reply.user.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {reply.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ReviewsStats.jsx
const ReviewsStats = ({ course }) => {
  const ratings = [5, 4, 3, 2, 1];
  const totalReviews = course.reviews?.length || 0;
  const averageRating = course.rating || 4.5;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Rating Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-2">{averageRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{totalReviews} reviews</p>
        </div>

        <div className="space-y-3">
          {ratings.map((stars) => {
            const count =
              course.reviews?.filter((r) => r.rating === stars).length || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm w-12 text-gray-500">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
