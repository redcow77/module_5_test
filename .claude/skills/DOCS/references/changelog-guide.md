# CHANGELOG 작성 가이드

## 기본 형식

[Keep a Changelog](https://keepachangelog.com/) 형식 따르기

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 추가될 기능 목록

### Changed
- 변경될 사항

### Fixed
- 수정될 버그

## [1.2.0] - 2024-01-15

### Added
- 사용자 프로필 이미지 업로드 기능
- 다국어 지원 (한국어, 영어)
- 다크 모드 추가

### Changed
- 로그인 UI 개선
- API 응답 속도 30% 향상
- 데이터베이스 쿼리 최적화

### Deprecated
- `/api/v1/old-endpoint` 엔드포인트 (v2.0.0에서 제거 예정)

### Removed
- IE11 지원 중단

### Fixed
- 로그아웃 후 세션 정리 안되던 버그 수정
- 이메일 중복 검증 오류 수정
- 모바일 화면 레이아웃 깨짐 수정

### Security
- JWT 토큰 만료 시간 설정
- XSS 취약점 수정

## [1.1.0] - 2023-12-01

### Added
- 사용자 검색 기능
- 페이지네이션 추가

### Fixed
- 로그인 오류 수정

## [1.0.0] - 2023-11-01

### Added
- 초기 릴리스
- 사용자 CRUD 기능
- 인증/인가 시스템

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

## 카테고리

### Added (추가)
- 새로운 기능

```markdown
### Added
- 사용자 프로필 편집 기능
- CSV 내보내기 기능
- 이메일 알림 설정
```

### Changed (변경)
- 기존 기능 변경

```markdown
### Changed
- 로그인 페이지 UI 개선
- API 응답 형식 변경
- 데이터베이스 마이그레이션 전략 변경
```

### Deprecated (폐기 예정)
- 곧 제거될 기능

```markdown
### Deprecated
- `/api/v1/users` 엔드포인트 (v2.0.0에서 제거 예정, `/api/v2/users` 사용 권장)
```

### Removed (제거)
- 제거된 기능

```markdown
### Removed
- Python 3.7 지원 중단
- Legacy API v1 완전 제거
```

### Fixed (수정)
- 버그 수정

```markdown
### Fixed
- 로그인 시 세션 누수 버그 수정 (#123)
- 이미지 업로드 실패 문제 해결 (#145)
- 모바일에서 메뉴 클릭 안되는 버그 수정
```

### Security (보안)
- 보안 관련 변경

```markdown
### Security
- SQL 인젝션 취약점 패치
- 비밀번호 해싱 알고리즘 bcrypt로 변경
- CORS 설정 강화
```

## Semantic Versioning

버전 번호: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (호환성 깨짐)
- **MINOR**: 새 기능 추가 (하위 호환)
- **PATCH**: 버그 수정 (하위 호환)

```
1.0.0 → 초기 릴리스
1.1.0 → 새 기능 추가
1.1.1 → 버그 수정
2.0.0 → Breaking changes
```

## 작성 예시

### 예시 1: Major 버전 업데이트

```markdown
## [2.0.0] - 2024-02-01

### Added
- TypeScript로 전면 재작성
- GraphQL API 추가

### Changed
- REST API 응답 형식 변경
- 인증 시스템 OAuth2로 전환

### Removed
- API v1 완전 제거
- Node.js 14 지원 중단

### BREAKING CHANGES
- API v1이 제거되었습니다. v2로 마이그레이션 필요
- 인증 방식이 변경되었습니다. OAuth2 토큰 사용 필요
```

### 예시 2: Minor 버전 업데이트

```markdown
## [1.3.0] - 2024-01-20

### Added
- 사용자 알림 시스템 추가
- 실시간 채팅 기능
- 파일 첨부 기능

### Changed
- 프로필 페이지 UI 개선
- 검색 성능 50% 향상

### Fixed
- 이메일 전송 실패 버그 수정
```

### 예시 3: Patch 버전 업데이트

```markdown
## [1.2.3] - 2024-01-10

### Fixed
- 로그인 후 리다이렉트 오류 수정 (#234)
- 이미지 로딩 지연 문제 해결 (#235)
- IE 호환성 문제 수정

### Security
- 의존성 보안 업데이트
```

## 자동화

### Conventional Commits 사용

```bash
feat: 사용자 프로필 이미지 업로드 추가
fix: 로그인 버그 수정
docs: README 업데이트
style: 코드 포맷팅
refactor: 사용자 서비스 리팩토링
test: 로그인 테스트 추가
chore: 의존성 업데이트
```

### 자동 생성 도구

```bash
# standard-version
npm install --save-dev standard-version
npm run release

# auto-changelog
npm install -g auto-changelog
auto-changelog
```

## 링크 추가

```markdown
## [1.2.0] - 2024-01-15

[Compare with previous version](https://github.com/user/repo/compare/v1.1.0...v1.2.0)

### Fixed
- 로그인 버그 수정 ([#123](https://github.com/user/repo/issues/123))
```

## 마이그레이션 가이드

Breaking changes 발생 시 포함:

```markdown
## [2.0.0] - 2024-02-01

### Migration Guide

#### API v1 → v2

**Before**
\`\`\`javascript
fetch('/api/v1/users')
\`\`\`

**After**
\`\`\`javascript
fetch('/api/v2/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
\`\`\`

#### Authentication

이전 API 키 방식:
\`\`\`
X-API-Key: your-api-key
\`\`\`

새 OAuth2 방식:
\`\`\`
Authorization: Bearer <access-token>
\`\`\`

자세한 내용은 [Migration Guide](docs/MIGRATION.md)를 참조하세요.
```

## 체크리스트

릴리스 전 확인:

- [ ] 모든 주요 변경사항 포함
- [ ] 버전 번호 올바름
- [ ] 날짜 정확
- [ ] 카테고리별 분류 완료
- [ ] 이슈 번호 링크
- [ ] Breaking changes 명시
- [ ] 마이그레이션 가이드 (필요시)
- [ ] 비교 링크 추가
