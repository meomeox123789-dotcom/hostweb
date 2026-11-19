# Technology Decisions and Current Version Checks

Version checks were made on 17 November 2026 against vendor sources. The selected versions are pinned in project manifests where practical; re-check the vendor advisories before a production release.

| Layer | Selected baseline | Reason |
|---|---|---|
| Node.js | 22 LTS | Supported runtime compatible with Next.js 16 minimum Node 20.9. |
| Next.js | 16.3.0 | Current stable line for the App Router; supports modern server/client rendering patterns. |
| React | 19.3.0 | Stable release dated 9 September 2026. |
| Tailwind CSS | 4.3.x | Current v4 feature line. |
| Java | 25 LTS | Long-term-support Java release. |
| Spring Boot | 4.1.2 | Stable release, not the 4.2 release candidate. |
| Spring Modulith | 2.1.1 | Stable 2.1 line aligned with the Spring Boot 4.1 generation. |
| PostgreSQL | 18.7 | Supported minor release as of 12 November 2026. |
| Redis | 8.2 | Extended support release; 5-year security/critical-fix window is documented by Redis. |

Official references:

- Next.js 16.3: https://nextjs.org/blog
- Next.js 16 requirements: https://nextjs.org/docs/app/getting-started/installation
- React versions: https://react.dev/versions
- Tailwind v4.3: https://tailwindcss.com/blog
- Spring Boot 4.1.2: https://spring.io/blog/2026/10/23/spring-boot-4-1-2-available-now/
- Spring Boot requirements: https://docs.spring.io/spring-boot/system-requirements.html
- Spring Modulith 2.1: https://docs.spring.io/spring-modulith/reference/
- PostgreSQL 18.7 release: https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released/
- Redis version support: https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/

Important: The local execution environment available while generating this project had Node 22, Java 21 and no Maven. The project targets Java 25 as selected, so run backend build and tests on Java 25 before treating the code as build-verified.
