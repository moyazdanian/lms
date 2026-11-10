<?php

namespace App\Http\Controllers;

use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    /**
     * Public blog listing: published posts only, newest first. The storefront
     * uses it for /blog (paginated) and for the homepage "latest posts"
     * section (per_page=3).
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $query = BlogPost::published()
            ->with('author:id,name,avatar')
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        $search = trim($data['search'] ?? '');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('excerpt', 'like', '%' . $search . '%');
            });
        }

        $posts = $query->paginate($data['per_page'] ?? 9);

        return response()->json([
            'data' => BlogPostResource::collection($posts->items())->resolve(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /** One published post, with its full content. */
    public function show(string $slug)
    {
        $post = BlogPost::published()
            ->with('author:id,name,avatar')
            ->where('slug', $slug)
            ->firstOrFail();

        return new BlogPostResource($post);
    }
}
