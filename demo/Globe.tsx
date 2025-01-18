export function Globe() {
  return (
    <svg width="100" height="100" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        id="tag-orbit"
        d="M249.5 154C309.557 154 363.685 165.267 402.611 183.267C441.959 201.462 464 225.592 464 250.5C464 275.408 441.959 299.538 402.611 317.733C363.685 335.733 309.557 347 249.5 347C189.443 347 135.315 335.733 96.3886 317.733C57.0406 299.538 35 275.408 35 250.5C35 225.592 57.0406 201.462 96.3886 183.267C135.315 165.267 189.443 154 249.5 154Z"
        stroke="transparent"
      />
      <path
        id="state-orbit"
        d="M165.929 298.75C135.9 246.739 118.593 194.23 114.719 151.518C110.802 108.344 120.679 77.1916 142.25 64.7378C163.821 52.2839 195.738 59.3065 231.17 84.2853C266.222 108.997 303.043 150.239 333.071 202.25C363.1 254.261 380.407 306.771 384.281 349.482C388.198 392.656 378.321 423.809 356.75 436.263C335.179 448.716 303.262 441.694 267.83 416.715C232.778 392.004 195.957 350.761 165.929 298.75Z"
        stroke="transparent"
      />
      <path
        id="jsx-orbit"
        d="M165.929 202.25C195.957 150.239 232.778 108.997 267.83 84.2853C303.262 59.3065 335.179 52.2839 356.75 64.7378C378.321 77.1916 388.198 108.344 384.281 151.518C380.407 194.23 363.1 246.739 333.071 298.75C303.043 350.761 266.222 392.004 231.17 416.715C195.738 441.694 163.821 448.716 142.25 436.263C120.679 423.809 110.802 392.656 114.719 349.482C118.593 306.771 135.9 254.261 165.929 202.25Z"
        stroke="transparent"
      />
      <path
        fill="black"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M99.1716 176.54C56.591 195.053 30 221.341 30 250.5C30 306.557 128.273 352 249.5 352C370.727 352 469 306.557 469 250.5C469 221.341 442.409 195.054 399.829 176.54C402.049 181.044 404.073 185.662 405.889 190.383C441.281 207.98 459 229.739 459 250.5C459 272.287 439.487 295.173 400.513 313.195C362.381 330.828 309.001 342 249.5 342C189.999 342 136.619 330.828 98.4872 313.195C59.5128 295.173 40 272.287 40 250.5C40 229.739 57.7188 207.98 93.1121 190.383C94.9281 185.662 96.9516 181.044 99.1716 176.54Z"
      />
      <path
        fill="black"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M170.259 296.25C140.508 244.721 123.494 192.906 119.698 151.067C115.819 108.303 125.882 79.9614 144.75 69.068C162.754 58.6737 190.507 63.1649 223.501 85.0928C228.55 84.3422 233.612 83.8272 238.673 83.5435C201.248 55.7633 165.067 45.791 139.75 60.4078C91.2033 88.4362 100.985 196.265 161.598 301.25C222.212 406.236 310.703 468.621 359.25 440.593C384.764 425.863 394.167 389.091 388.548 342.275C385.79 346.514 382.832 350.641 379.677 354.639C382.421 394.779 372.417 421.444 354.25 431.933C335.382 442.826 305.806 437.37 270.711 412.629C236.375 388.422 200.009 347.779 170.259 296.25Z"
      />
      <path
        fill="black"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M119.247 355.809C116.774 395.297 126.76 421.546 144.75 431.933C163.618 442.826 193.194 437.37 228.289 412.629C262.625 388.422 298.991 347.779 328.741 296.25C358.492 244.721 375.506 192.906 379.302 151.067C383.181 108.303 373.118 79.9614 354.25 69.068C336.213 58.6541 308.389 63.1818 275.313 85.2169C270.302 84.4464 265.277 83.9082 260.254 83.5983C297.705 55.7765 333.916 45.7813 359.25 60.4078C407.797 88.4362 398.015 196.265 337.402 301.25C276.788 406.236 188.297 468.621 139.75 440.593C114.473 425.999 105.009 389.772 110.299 343.576C113.085 347.772 116.069 351.855 119.247 355.809Z"
      />
      <g id="globe">
        <path
          fill="black"
          d="M249.5 83C157.141 83 82 158.141 82 250.5C82 342.859 157.141 418 249.5 418C341.859 418 417 342.859 417 250.5C417 158.141 341.859 83 249.5 83ZM94.182 250.5C94.182 225.912 99.9501 202.644 110.169 181.96L125.778 192.256V205.577L136.439 212.43L138.341 239.842L130.346 277.148L137.96 290.854L141.768 304.554L160.168 316.481L159.405 329.429L164.479 336.029L168.542 337.55L168.287 342.624L172.603 344.151L171.84 352.524L168.034 354.304V368.509L177.171 375.62L182.501 384.499L188.338 376.888L188.843 371.556L183.261 369.272L183.769 360.64L193.919 342.882L209.338 336.913L225.325 322.639H234.463L236.176 315.023L240.173 313.691L240.65 307.602L249.882 305.507H253.403L258.445 303.223L259.208 301.036L259.016 297.133C259.208 284.191 237.129 272.958 237.129 272.958L234.273 268.39H225.518C223.994 263.442 210.67 252.405 210.67 252.405L200.393 253.926L193.54 252.974L187.64 236.984L174.695 234.131L161.563 232.036L159.468 235.273L148.428 234.321L145.955 232.415L144.812 219.473L141.768 216.999V207.104L144.052 201.962C144.052 201.962 143.67 196.446 144.052 192.635C144.431 188.83 151.284 181.219 151.284 181.219L153.697 183.756L156.994 187.314L159.279 184.898L162.453 182.993L164.355 179.566H167.021L169.937 184.898C169.937 184.898 171.461 185.788 172.095 186.419C172.726 187.05 177.042 183.63 177.042 183.63L181.737 182.488L182.627 188.577H186.435L187.448 182.614L189.861 175.382L194.683 173.855V166.245C194.683 166.245 196.585 163.197 199.122 163.329C201.659 163.461 204.328 168.024 204.328 168.024C204.328 168.024 210.036 168.782 212.828 168.024C215.617 167.261 223.612 160.276 223.612 160.276L224.884 158.887L227.549 159.139L229.452 160.276H236.176L239.602 153.808H243.029L244.266 150.571H249.5V153.808H255.018C255.018 153.808 258.637 153.429 258.637 150.571C258.637 147.718 262.635 146.576 262.635 146.576V138.77L257.495 136.296L252.76 134.58C252.76 134.58 252.166 132.107 252.737 126.97C253.308 121.827 243.789 116.501 243.789 116.501L238.842 115.17L236.747 117.259L233.892 117.643C233.892 117.643 232.749 121.449 232.749 122.022C232.749 122.591 232.178 128.68 231.418 129.822C230.657 130.965 227.231 129.822 227.231 129.822L225.897 123.922V116.117C225.897 116.117 229.894 113.454 230.657 111.554C231.418 109.648 240.555 109.459 240.555 109.459L241.887 106.985L239.878 95.5063C243.063 95.3111 246.266 95.1791 249.5 95.1791C255.423 95.1791 261.26 95.5464 267.011 96.195V101.274L269.462 105.458H275.388L282.238 107.364V99.5583L282.473 98.7376C311.816 105.108 338.094 119.778 358.704 140.188L353.553 144.67L351.78 159.392L346.448 161.676L340.863 167.008V174.108L335.79 177.666L329.953 178.929V191.877H331.984L333.758 200.756L341.371 203.041L347.211 204.561L348.985 201.009L353.806 201.52L357.361 208.12L355.077 211.168L350.761 213.446H345.687L336.295 217.952L329.953 221.189V226.899H334.392L339.532 230.136L345.687 231.847L352.664 234.699L361.419 238.126H368.083L369.607 236.415L374.743 235.841L377.409 240.031L383.691 241.937L390.162 240.605L399.3 245.553L398.347 253.353L401.963 259.258H404.557C404.304 263.775 403.845 268.235 403.211 272.643L402.281 271.311L386.039 273.854L379.949 268.774H369.454V250.5H353.553L340.863 254.053L329.953 250.5L306.349 259.258L302.289 272.838L315.994 288.57L317.007 297.707L302.289 316.481L308.381 330.697L311.931 340.34H318.531L329.953 330.697L339.34 340.34L357.109 332.729L360.659 343.387L351.522 352.019L334.774 354.55L333.758 371.815L324.624 384.499L325.235 386.031C302.814 398.606 276.989 405.821 249.5 405.821C163.859 405.821 94.182 336.144 94.182 250.5Z"
        />
        <path d="M181.897 213H174.791L171.104 218.251L169 226H182.947L186.634 223.502H189V218.251L181.897 215.628V213Z" fill="black" />
        <path
          d="M322.121 160.836L324.439 165.767L329.592 167L335 159.849V154.673L327.786 149H322.121L318 155.409L320.059 160.591L322.121 160.836Z"
          fill="black"
        />
      </g>
      <g mask="url(#jsx-mask)">
        <ellipse id="jsx" cx="0" cy="0" rx="24.5" ry="25" fill="#0075FF">
          <animateMotion repeatCount="indefinite" dur="5s">
            <mpath href="#jsx-orbit" />
          </animateMotion>
        </ellipse>
      </g>
      <g mask="url(#state-mask)">
        <g transform="translate(-360, -440)">
          <path id="state" d="M361 401L390.445 452H331.555L361 401Z" fill="#FF002E">
            <animateMotion repeatCount="indefinite" dur="5s" begin="-2s">
              <mpath href="#state-orbit" />
            </animateMotion>
          </path>
        </g>
      </g>
      <g mask="url(#tag-mask)">
        <rect id="tag" x="-24" y="-24" width="49" height="49" fill="#00BA6C">
          <animateMotion repeatCount="indefinite" dur="5s" begin="-2s">
            <mpath href="#tag-orbit" />
          </animateMotion>
        </rect>
      </g>
      <mask id="state-mask">
        <rect width="100%" height="100%" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M393.242 167.059C346.988 86.9454 244.547 59.4963 164.433 105.75C164.289 105.834 164.144 105.917 164 106.001L331.5 396.118C331.644 396.035 331.789 395.952 331.933 395.869C412.047 349.615 439.496 247.173 393.242 167.059Z"
          fill="black"
        />
      </mask>
      <mask id="tag-mask">
        <rect width="100%" height="100%" fill="white" />
        <path
          id="tag-mask"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M249.5 83C156.993 83 82.0005 157.992 82.0005 250.5C82.0005 250.667 82.0007 250.833 82.0012 251L417 251C417 250.833 417 250.667 417 250.5C417 157.992 342.008 83 249.5 83Z"
          fill="black"
        />
      </mask>
      <mask id="jsx-mask">
        <rect width="100%" height="100%" fill="white" />
        <path
          id="jsx-mask"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M104.75 167.059C58.4961 247.173 85.9452 349.615 166.059 395.869C166.204 395.952 166.348 396.035 166.493 396.118L333.992 106.001C333.848 105.917 333.704 105.833 333.559 105.75C253.445 59.4962 151.004 86.9452 104.75 167.059Z"
          fill="black"
        />
      </mask>
    </svg>
  )
}
