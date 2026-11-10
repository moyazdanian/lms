export default function CourseDetailsMainContent(){
    return (
        <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                  {/* Tabs Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid grid-cols-4 lg:grid-cols-6 mb-6">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="curriculum"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Curriculum
                      </TabsTrigger>
        
                      <TabsTrigger
                        value="reviews"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Reviews ({course.reviews?.length || 0})
                      </TabsTrigger>
        
                      <TabsTrigger
                        value="instructor"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Instructor ({course.reviews?.length || 0})
                      </TabsTrigger>
                    </TabsList>
        
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8">
                      <CourseDetailsOverviewTab course={course} />
                    </TabsContent>
        
                    {/* Curriculum Tab */}
                    <TabsContent value="curriculum">
                      <CourseDetailsCurriculumTab course={course} />
                    </TabsContent>
        
                    {/* Instructor Tab */}
                    <TabsContent value="instructor">
                      <Card>
                        <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                              <div className="sticky top-6">
                                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                                  <AvatarImage
                                    src={
                                      course?.instructor?.avatar ||
                                      "/avatar-placeholder.png"
                                    }
                                    alt={course?.instructor?.name}
                                  />
                                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {course?.instructor?.name?.charAt(0) || "I"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                  <h3 className="text-2xl font-bold mb-2">
                                    {course?.instructor?.name || "Instructor"}
                                  </h3>
                                  <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                                    {course?.instructor?.expertise ||
                                      "Expert Instructor"}
                                  </Badge>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span>4.9 Instructor Rating</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                      <Award className="w-4 h-4 text-blue-500" />
                                      <span>25,000+ Students</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                      <Video className="w-4 h-4 text-green-500" />
                                      <span>15 Courses</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="md:w-2/3 space-y-6">
                              <div>
                                <h4 className="text-xl font-bold mb-4">
                                  About the Instructor
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {course?.instructor?.bio ||
                                    "Experienced professional with years of industry experience and a passion for teaching. Dedicated to helping students succeed in their learning journey."}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    10+
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Years Experience
                                  </div>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    25K+
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Students Taught
                                  </div>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    4.9/5
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Average Rating
                                  </div>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    15
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Courses Created
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xl font-bold mb-4">
                                  Teaching Style
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                  Focuses on practical, hands-on learning with
                                  real-world projects. Believes in making complex
                                  concepts simple and accessible to everyone.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">Practical Projects</Badge>
                                  <Badge variant="outline">Clear Explanations</Badge>
                                  <Badge variant="outline">Student Support</Badge>
                                  <Badge variant="outline">Real-world Examples</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
        
                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                      <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                          {/* Add Review */}
                          {user && (
                            <Card className="mb-6">
                              <CardHeader>
                                <CardTitle>Add Your Review</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Formik
                                  initialValues={{ rating: 5, review: "" }}
                                  validationSchema={YupObject({
                                    review: textSchema,
                                  })}
                                  onSubmit={(values, { resetForm }) => {
                                    storeCommentQuery({
                                      course_id: course.id,
                                      comment: values.review,
                                      rating: values.rating,
                                    });
                                    resetForm();
                                  }}
                                >
                                  {({
                                    errors,
                                    getFieldProps,
                                    handleSubmit,
                                    isSubmitting,
                                  }) => (
                                    <form onSubmit={handleSubmit}>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-2">
                                            Your Rating
                                          </label>
                                          <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <button key={star} className="text-2xl">
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
                                          <div>
                                            <span className="text-red-400">
                                              {errors.review}
                                            </span>
                                          </div>
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
                          )}
        
                          {/* Reviews List */}
                          <div className="space-y-4">
                            {course.reviews?.length > 0 ? (
                              course.reviews.map((review, index) => (
                                <Card key={index}>
                                  <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                      <Avatar>
                                        <AvatarImage src={review.user.avatar} />
                                        <AvatarFallback>
                                          {review.user.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <h4 className="font-semibold">
                                              {review.user.name}
                                            </h4>
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
                                        <p className="text-gray-700 dark:text-gray-300">
                                          {review.comment}
                                        </p>
        
                                        <div className="flex items-center gap-4 mt-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8"
                                            onClick={() => {
                                              if (reply && reply === review.id) {
                                                setReply(null);
                                              } else {
                                                setReply(review.id);
                                              }
                                            }}
                                          >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Reply
                                          </Button>
                                        </div>
                                        {reply === review.id && (
                                          <div>
                                            <Formik
                                              initialValues={{ rating: 5, review: "" }}
                                              validationSchema={YupObject({
                                                review: textSchema,
                                              })}
                                              onSubmit={(values, { resetForm }) => {
                                                storeCommentQuery({
                                                  course_id: course.id,
                                                  comment: values.review,
                                                  rating: values.rating,
                                                  parent_id: review.id,
                                                });
                                                resetForm();
                                              }}
                                            >
                                              {({ getFieldProps, handleSubmit }) => (
                                                <form onSubmit={handleSubmit}>
                                                  <Textarea
                                                    rows={4}
                                                    placeholder={`Share your comment with ${review.user}`}
                                                    {...getFieldProps("review")}
                                                  />
                                                  <Button
                                                    className="mt-3 w-full"
                                                    type="submit"
                                                  >
                                                    {isSubmittingReview ? (
                                                      <Spinner />
                                                    ) : (
                                                      "Submit Reply"
                                                    )}
                                                  </Button>
                                                </form>
                                              )}
                                            </Formik>
                                          </div>
                                        )}
                                      </div>
                                    </div>
        
                                    <div>
                                      {review.replies.length > 0
                                        ? review.replies.map((reply) => (
                                            <>
                                              <Separator className="my-3" />
                                              <div className="flex items-start gap-4 ml-10">
                                                <Avatar>
                                                  <AvatarImage
                                                    src={reply.user.avatar}
                                                  />
                                                  <AvatarFallback>
                                                    {reply.user.name.charAt(0)}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                      <h4 className="font-semibold">
                                                        {reply.user.name}
                                                      </h4>
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
                                            </>
                                          ))
                                        : null}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <Card>
                                <CardContent className="py-12 text-center">
                                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                  <h3 className="text-lg font-semibold mb-2">
                                    No reviews yet
                                  </h3>
                                  <p className="text-gray-500 mb-4">
                                    Be the first to share your thoughts about this
                                    course!
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
                        <div>
                          <Card className="sticky top-6">
                            <CardHeader>
                              <CardTitle>Rating Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center mb-6">
                                <div className="text-5xl font-bold mb-2">
                                  {course.rating || 4.5}
                                </div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < Math.floor(course.rating || 4.5)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-gray-300 text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {course.reviews?.length || 0} reviews
                                </p>
                              </div>
                              <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((stars) => (
                                  <div key={stars} className="flex items-center gap-2">
                                    <span className="text-sm w-8">{stars}★</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${(stars / 5) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm w-12 text-gray-500">
                                      {(stars / 5) * 100}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
        
                  {/* Related Courses */}
                  {/* {relatedCourses.length > 0 && (
                    <section className="mt-16">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Related Courses</h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            Expand your knowledge with these related courses
                          </p>
                        </div>
                        <Link href="/courses">
                          <Button variant="outline">
                            View All Courses
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedCourses.map((relatedCourse) => (
                          <Course key={relatedCourse.id} course={relatedCourse} />
                        ))}
                      </div>
                    </section>
                  )} */}
                </div>
              </div>
    )
}