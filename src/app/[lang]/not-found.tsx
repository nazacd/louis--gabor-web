import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="label text-muted">404</div>
      <h1 className="display mt-5 text-[44px] md:text-[64px]">Страница не найдена</h1>
      <p className="mt-3 text-[15px] text-muted">Sahifa topilmadi</p>
      <Link href="/ru/catalog/" className="btn btn-ink mt-8">
        Каталог
      </Link>
    </div>
  );
}
