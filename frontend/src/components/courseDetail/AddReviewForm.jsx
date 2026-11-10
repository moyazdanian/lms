const AddReviewForm = ({ courseId }) => {
  const { mutate: storeCommentQuery, isPending: isSubmittingReview } = useStoreReview();

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