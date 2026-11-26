export async function onRequestGet({ params, env }) {
    try {
        const post = await env.DB.prepare(
            "SELECT * FROM posts WHERE id = ? OR slug = ?"
        ).bind(params.id, params.id).first();

        if (!post) return Response.json({ error: "Post not found" }, { status: 404 });
        return Response.json(post);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function onRequestPut({ params, request, env }) {
    const auth = request.headers.get("Authorization");
    const adminPass = env.ADMIN_PASSWORD || "admin123";

    if (auth !== `Bearer ${adminPass}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, slug, excerpt, content, status } = await request.json();
        await env.DB.prepare(
            "UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, status = ? WHERE id = ?"
        ).bind(title, slug, excerpt || "", content, status || "published", params.id).run();

        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function onRequestDelete({ params, request, env }) {
    const auth = request.headers.get("Authorization");
    const adminPass = env.ADMIN_PASSWORD || "admin123";

    if (auth !== `Bearer ${adminPass}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(params.id).run();
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
