# YSY를 소개합니다!
## 💻 프로젝트 개요
커플 간의 일정, 앨범 등을 공유하여 손쉽게 추억을 공유 및 저장하고자 앱을 기획하게 됐습니다.
`React Natvie`, `Nodejs`, `Typescript` 기술을 공부하고 적용하여 하나의 앱을 만들고자 하였습니다.

## 프로젝트 소개
YSY 프로젝트는 커플들 간의 앨범, 일정 등을 공유하고 데이트 장소를 추천해주는 모바일 앱입니다.
해당 모바일 앱을 사용하여 일정을 관리하고 추억을 쌓아보세요!

## 🕐 개발 기간
기술 공부, 개발 기간까지 총 **8개월**이 걸렸습니다.
* 2023-01-01 ~ 2023-11-06
* 중간고사 1달, 기말고사 1달, 훈련소 1달은 제외됩니다.

## 개발 환경과 멤버 구성
### 🧑‍🤝‍🧑 멤버 구성
*  총괄, 디자인, 백엔드 - 김승용
    * 전체적인 기획 구성
    * 백엔드 및 프론트 기본 구성
    * 앱 디자인
    * 백엔드 개발
    * 전체적인 DB 설계
* 기획, 프론트엔드 개발 - 윤성빈
  * 전체적인 기획 구성
  * 프론트 디자인 구성
  * API 연결


### 🔐 개발 환경
* `React Native v0.72.1`
* `Nodejs v18.12.1`
* `Typescript v4.9.4`
* `Mysql v8.0`
* 디자인 : Adobe XD
* Redis

### 사용 기술 및 프레임워크
* GCS (Google Cloud Storage)
* Redis
* JWT
* `Sequelize v6.28.0`
* `Express v4.18.2`

## 디자인
<img src="/images/xd.png" width="360" height="640" />
상세한 디자인 정보는 (https://xd.adobe.com/view/fddf2559-a602-43bb-8210-22f3d686dd5a-a88c/grid/) 확인하시면 됩니다.

## 주요 기능
### SNS 로그인
구글, 카카오, 네이버 로그인을 통하여 간편하게 회원가입 및 로그인을 하기 위해 구현하였습니다.
* Kakao Login
* Naver Login
* Google Login

### Album
* GCS(Google Cloud Storage)를 통한 단일, 다중 업로드
* 앨범 추가, 삭제, 합치기, 썸네일 변경
* 앨범 정렬 
* 앨범 이미지 추가, 삭제

<div align="center">
  <img src="/images/album.png" width="360" height="640" />
  <img src="/images/album_detail.png" width="360" height="640" />
</div>

### 일정 관리
* 캘린더 추가, 수정, 삭제
  
<div align="center">
  <img src="/images/calendar.png" width="360" height="640" />
</div>

### 데이트 장소 추천
* Batch를 통해 Tour API 호출
* 한국의 관광지, 음식점, 쇼핑몰, 문화시설, 스포츠 시설 정보를 DB 저장
* 조회수, 제목순으로 정렬 및 찜 기능 제공
  
<div align="center">
  <img src="/images/date.png" width="360" height="640" />
  <img src="/images/date_detail.png" width="360" height="640" />
</div>
