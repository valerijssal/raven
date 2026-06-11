export default function RavenIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/*
        Minimalistic raven perched, facing right:
        - round head, sharp beak
        - compact body
        - folded wing suggestion
        - forked tail
        - two thin legs
      */}
      <path d="
        M20 5
        C18.3 5 17 6.1 16.5 7.6
        C15.8 7.2 14.9 7 14 7
        C10.7 7 8 9.7 8 13
        L8 17
        C8 17.6 8.4 18 9 18
        L10 18
        L9.5 22
        L11.5 22
        L12.5 18
        L14.5 18
        L13.5 22
        L15.5 22
        L16.5 18
        L18 18
        C20.2 18 22 16.2 22 14
        L22 11
        C23.1 10.4 24 9.3 24 8
        C24 6.3 22.2 5 20 5
        Z
        M20 7
        C20.6 7 21 7.4 21 8
        C21 8.4 20.7 8.7 20.4 8.9
        C20.1 8.3 19.6 7.9 19 7.6
        C19.3 7.2 19.6 7 20 7
        Z
      " />
    </svg>
  );
}
