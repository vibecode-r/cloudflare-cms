export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const all = url.searchParams.get('all');

    try {
        const query = all === 'true'
            ? "SELECT * FROM posts ORDER BY created_at DESC"
            : "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC";

        const { results } = await env.DB.prepare(query).all();
        return Response.json(results);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}

export async function onRequestPost({ request, env }) {
    const auth = request.headers.get("Authorization");
    const adminPass = env.ADMIN_PASSWORD || "admin123";

    if (auth !== `Bearer ${adminPass}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, slug, excerpt, content, status } = await request.json();
        const finalSlug = (slug || title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const info = await env.DB.prepare(
            "INSERT INTO posts (title, slug, excerpt, content, status) VALUES (?, ?, ?, ?, ?)"
        ).bind(title, finalSlug, excerpt || "", content, status || "published").run();

        return Response.json({ success: true, id: info.meta.last_row_id, slug: finalSlug }, { status: 201 });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
