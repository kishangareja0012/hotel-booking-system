<template>
  <fragment>
    <!--    <img v-if="!asLoggedIn" class="logged-out-placeholder" src="/assets/images/sidenav.svg"/>-->
    <SideNavMenuPlaceholder v-if="!asLoggedIn" class="logged-out-placeholder" />
    <ul v-else class="sidenav-menu">
      <!--
      <router-link :to="{ name: 'home' }" exact class="sidenav-menu-item" tag="li">
        <a>
          <icon class="icon" width="17" height="17" type="dashboard"/>
          <span>Dashboard</span>
        </a>
      </router-link>
      -->
      <router-link
        :to="{ name: 'dashboard' }"
        exact
        class="sidenav-menu-item"
        tag="li"
        v-if="hasProperties && pageAllowed('dashboard')"
      >
        <a :style="currentBackground">
          <span :style="isDashboardActive  ?
            currentBackground : currentColor">
            <icon class="icon" width="19" height="19" type="dashboard"/>
            <span>{{ $t('navbarTitles.dashboard') }}</span>
          </span>
        </a>
      </router-link>
      <router-link
        to="/reservations"
        class="sidenav-menu-item"
        tag="li"
        v-if="hasProperties && pageAllowed('reservations')"
      >
        <a :style="currentBackground">
          <span :style="isReservationsActive ?
            currentBackground : currentColor">
            <icon class="icon" width="19" height="21" type="reservations"/>
            <span>{{ $t('navbarTitles.reservations') }}</span>
          </span>
        </a>
      </router-link>
      <router-link
        to="/calendar"
        tag="li"
        class="sidenav-menu-item"
        v-if="hasProperties && pageAllowed('calendar')"
      >
        <a :style="currentBackground">
          <span :style="isCalendarActive ?
            currentBackground : currentColor">
            <icon class="icon" width="19" height="19" type="calendar"/>
            <span>{{ $t('navbarTitles.calendar') }}</span>
          </span>
          <!--
          <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          -->
        </a>
        <!--
        <ul class="sidenav-menu-dropdown">
          <router-link to="/calendar/quickupdate" class="sidenav-menu-item" tag="li">
            <a>
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Quick Update</span>
            </a>
          </router-link>
          <router-link to="/calendar/settings" class="sidenav-menu-item" tag="li">
            <a href="#">
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Settings</span>
            </a>
          </router-link>
        </ul>
        -->
      </router-link>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown"
          :class="{ active: isProductsActive }"
          v-if="hasProperties &&
            pageAllowed('photos', 'roomtypes', 'rateplans', 'mealplans',
                        'policies', 'promotions', 'contracts', 'settings')">
        <a @click.prevent="toggleMenu('products')"
           :style="currentBackground">
          <span :style="currentColor">
            <icon class="icon" width="19" height="21" type="rateplans"/>
            <span>{{ $t('navbarTitles.products') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            v-if="pageAllowed('roomtypes')"
            to="/room-types" class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isRoomTypesActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.roomTypes') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('rateplans')"
            to="/rate-plans"
            class="sidenav-menu-item"
            tag="li">
            <a :style="currentBackground">
              <span :style="isRatePlansActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.ratePlans') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('mealplans')"
            to="/meal-plans" class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isMealPlansctive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.mealPlans') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('promotions')"
            to="/promotions" class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isPromotionsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.promotions') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('contracts')"
            to="/contracts" class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isContractsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.contracts') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('photos')"
            to="/photos" class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isPhotosActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.photos') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('policies')"
            to="/policies"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isPoliciesActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.policies') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('settings')"
            to="/settings"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isSettingsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('settings.title') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown"
          :class="{ active: isDistributorsActive }"
          v-if="hasProperties && pageAllowed('bookingengine', 'channels', 'systems')">
        <a
          @click.prevent="toggleMenu('distributors')"
          :style="currentBackground">
          <span :style="currentColor">
            <icon class="icon" width="20" height="22" type="connect"/>
            <span>{{ $t('navbarTitles.connectivity') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            v-if="pageAllowed('bookingengine')"
            :to="{ name: 'channel', params: { id: bookingEngineId } }"
            class="sidenav-menu-item"
            tag="li"
            :exact="false"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isBookingEngineActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.bookingengine') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('channels')"
            to="/channels"
            class="sidenav-menu-item"
            tag="li"
            :exact="$route.params.id === bookingEngineId || false"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isChannelsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.channels') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('systems')"
            to="/systems"
            class="sidenav-menu-item"
            tag="li"
            :exact="false"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isSystemsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.systems') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown" :class="{ active: isPropertyActive }"
          v-if="hasProperties &&
            pageAllowed('facilities', 'nearby', 'contactpersons', 'description', 'booking', 'masterdata')">
        <a
          @click.prevent="toggleMenu('property')"
          :style="currentBackground">
          <span :style="currentColor">
            <icon class="icon" width="19" height="21" type="home"/>
            <span>{{ $t('navbarTitles.property') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            v-if="pageAllowed('masterdata')"
            to="/master-data"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isMasterDataActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.masterdata') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('booking')"
            to="/booking-status"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isBookingActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.booking') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('description')"
            to="/descriptions"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isDescriptionActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.description') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('contactpersons')"
            to="/contact-persons"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isContactPersonsActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.contactpersons') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('nearby')"
            to="/nearby"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isNearbyActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.nearby') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="pageAllowed('facilities')"
            to="/facilities"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isFacilitiesActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.facilities') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown" :class="{ active: isManageActive }"
          v-if="userPageAllowed('group', 'properties', 'users')">
        <a :style="currentBackground"
           @click.prevent="toggleMenu('manage')">
          <span :style="currentColor">
            <icon class="icon" width="22" height="22" type="settings"/>
            <span>{{ $t('navbarTitles.management') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            v-if="userPageAllowed('group')"
            to="/group"
            class="sidenav-menu-item d-none d-md-block"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isGroupActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.group') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="userPageAllowed('properties')"
            to="/properties"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isPropertiesActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.hotels') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="userPageAllowed('users')"
            to="/users"
            class="sidenav-menu-item"
            tag="li"
          >
            <a :style="currentBackground">
              <span :style="isUsersActive ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.users') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown" :class="{ active: isSystemHealthActive }"
          v-if="userPageAllowed('emergencystop', 'outages', 'channelshealth', 'suppliershealth')">
        <a
          @click.prevent="toggleMenu('systemHealth')"
          :style="currentBackground">
          <span :style="currentColor">
            <icon class="icon" width="20" height="22" type="connect"/>
            <span>{{ $t('menu.system-health') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            v-if="userPageAllowed('emergencystop')"
            class="sidenav-menu-item"
            to="/emergencystop"
            tag="li"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isEmergencyStop ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.emergencystop') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="userPageAllowed('outages')"
            class="sidenav-menu-item"
            to="/outages"
            tag="li"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isOutages ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.outages') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="userPageAllowed('channelshealth')"
            class="sidenav-menu-item"
            to="/channelshealth"
            tag="li"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isChannelsHealth ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.channelshealth') }}</span>
              </span>
            </a>
          </router-link>
          <router-link
            v-if="userPageAllowed('suppliershealth')"
            class="sidenav-menu-item"
            to="/suppliershealth"
            tag="li"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isSuppliershealth ?
                currentBackground : currentColor">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.suppliershealth') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <hr v-if="isAdmin" />
      <li class="sidenav-menu-item sidenav-menu-item-dropdown" :class="{ active: isAdminActive }"
          v-if="isAdmin">
        <a
          @click.prevent="toggleMenu('admin')"
          :style="currentBackground"
        >
          <span :style="currentColor">
            <icon class="icon" width="24" height="24" type="admin"/>
            <span>{{ $t('navbarTitles.admin') }}</span>
            <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
          </span>
        </a>
        <ul class="sidenav-menu-dropdown">
          <router-link
            to="/admin/groups"
            class="sidenav-menu-item"
            tag="li"
            :exact="false"
            active-class="exact-active"
          >
            <a :style="currentBackground">
              <span :style="isPropertyGroupsActive ?
                currentBackground : (this.$route.params.id ? currentBackground : currentColor )">
                <icon class="icon" width="5" height="5" type="dot"/>
                <span>{{ $t('navbarTitles.groups') }}</span>
              </span>
            </a>
          </router-link>
        </ul>
      </li>
      <!--
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="19" height="19" type="color-customization"/>
          <span>Color customization</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="20" height="19" type="email-customization"/>
          <span>Email customization</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="12" height="15" type="text-customization"/>
          <span>Text customization</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="20" height="16" type="translation-tool"/>
          <span>Translation tool</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Payment provider</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Picture administation</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>File administration</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Property details</span>
        </a>
      </li>
      <li
        class="sidenav-menu-item sidenav-menu-item-dropdown"
        :class="{
          open: expandRooms
        }"
      >
        <a
          href="#"
          @click="expandRooms = !expandRooms"
        >
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Rooms & Rates</span>
          <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
        </a>
        <ul class="sidenav-menu-dropdown">
          <li class="sidenav-menu-item">
            <a href="#">
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Quick Update</span>
            </a>
          </li>
          <li class="sidenav-menu-item">
            <a href="#">
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Invoice archive</span>
        </a>
      </li>
      <li class="sidenav-menu-item">
        <a href="#">
          <icon class="icon" width="22" height="22" type="blank-circle"/>
          <span>Logging</span>
        </a>
      </li>
      <li class="sidenav-menu-item sidenav-menu-item-dropdown"
          :class="{ open: expandUA }"
      >
        <a
          href="#"
          @click="expandUA = !expandUA"
        >
          <icon class="icon" width="23" height="15" type="user-group"/>
          <span>Users & Access</span>
          <icon class="arrow" stroke-width="2" width="12" height="7" type="arrow-down"/>
        </a>
        <ul class="sidenav-menu-dropdown">
          <li class="sidenav-menu-item">
            <a href="#">
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Quick Update</span>
            </a>
          </li>
          <li class="sidenav-menu-item">
            <a href="#">
              <icon class="icon" width="5" height="5" type="dot"/>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </li>
      -->
      <li class="sidenav-menu-item">
        <button v-if="showFeedback" @click="poupulatefeedbackForm" :style="feedBackButtonStyle" id="feedback-form">
          <icon width="27" height="21" type="quick-update"/>
          <span>{{ $t('navbarTitles.feedback') }}</span>
        </button>
      </li>
    </ul>
  </fragment>
</template>

<script>
  import { mapGetters } from 'vuex';
  import i18n from '@/i18n';
  import SideNavMenuPlaceholder from '@/components/SideNavMenuPlaceholder.vue';
  import { bookingEngineId } from '@/shared';

  export default {
    name: 'SideNav',
    components: { SideNavMenuPlaceholder },
    data: () => ({
      menu: {
        products: false,
        property: false,
        distributors: false,
        systemHealth: false,
        manage: false,
        admin: false,
      },
      bookingEngineId,
      showFeedback: process.env.VUE_APP_ZAMMAD_FEEDBACK_ENABLED === 'true',
    }),
    computed: {
      ...mapGetters('user', ['user', 'loggedIn', 'hasProperties', 'pageAllowed', 'userPageAllowed', 'currentColorFont', 'isAdmin', 'currentColorSchema']),
      ...mapGetters(['centered']),
      currentColor() {
        const {
          r, g, b, a,
        } = this.currentColorFont.rgba;
        return `color: rgba(${r}, ${g}, ${b}, ${a})`;
      },
      feedBackButtonStyle() {
        const {
          r: br, g: bg, b: bb, a: ba,
        } = this.currentColorFont.rgba;
        const {
          r: cr, g: cg, b: cb, a: ca,
        } = this.currentColorSchema.rgba;
        return {
          background: `rgba(${cr}, ${cg}, ${cb}, ${ca})`,
          color: `rgba(${br}, ${bg}, ${bb}, ${ba})`,
        };
      },
      currentBackground() {
        const {
          r, g, b, a,
        } = this.currentColorSchema.rgba;
        if (`${r}` >= 200 && `${g}` >= 200 && `${b}` >= 200) {
          return `color: rgba(${this.currentColorFont.rgba.r}, ${this.currentColorFont.rgba.g}, ${this.currentColorFont.rgba.b}, ${this.currentColorFont.rgba.a})`;
        }
        return `color: rgba(${r}, ${g}, ${b}, ${a})`;
      },
      asLoggedIn() {
        return this.loggedIn && !this.centered;
      },
      isProductsActive() {
        return this.menu.products
          || ['rateplans', 'roomtypes', 'policies', 'photos', 'mealplans', 'promotions', 'contracts', 'settings'].includes(this.$route.name);
      },
      isPropertyActive() {
        return this.menu.property
          || ['masterdata', 'contactpersons', 'facilities', 'nearby', 'booking', 'description'].includes(this.$route.name);
      },
      isDistributorsActive() {
        return this.menu.distributors || ['channels', 'channel', 'systems'].includes(this.$route.name);
      },
      isManageActive() {
        return this.menu.manage || ['group', 'properties', 'users'].includes(this.$route.name);
      },
      isSystemHealthActive() {
        return this.menu.systemHealth || ['channelshealth', 'emergencystop', 'outages', 'suppliershealth'].includes(this.$route.name);
      },
      isChannelsHealth() {
        return ['channelshealth'].includes(this.$route.name);
      },
      isEmergencyStop() {
        return ['emergencystop'].includes(this.$route.name);
      },
      isOutages() {
        return ['outages'].includes(this.$route.name);
      },
      isSuppliershealth() {
        return ['suppliershealth'].includes(this.$route.name);
      },
      isAdminActive() {
        const { name } = this.$route;
        return this.menu.admin || (name != null && name.indexOf('admin-') === 0);
      },
      isGroupActive() {
        return ['group'].includes(this.$route.name);
      },
      isPropertiesActive() {
        return ['properties'].includes(this.$route.name);
      },
      isUsersActive() {
        return ['users'].includes(this.$route.name);
      },
      isDashboardActive() {
        return ['dashboard'].includes(this.$route.name);
      },
      isReservationsActive() {
        return ['reservations'].includes(this.$route.name);
      },
      isCalendarActive() {
        return ['calendar'].includes(this.$route.name);
      },
      isRoomTypesActive() {
        return ['roomtypes'].includes(this.$route.name);
      },
      isRatePlansActive() {
        return ['rateplans'].includes(this.$route.name);
      },
      isMealPlansctive() {
        return ['mealplans'].includes(this.$route.name);
      },
      isPromotionsActive() {
        return ['promotions'].includes(this.$route.name);
      },
      isContractsActive() {
        return ['contracts'].includes(this.$route.name);
      },
      isPhotosActive() {
        return ['photos'].includes(this.$route.name);
      },
      isPoliciesActive() {
        return ['policies'].includes(this.$route.name);
      },
      isSettingsActive() {
        return ['settings'].includes(this.$route.name);
      },
      isChannelsActive() {
        return ['channels', 'channel'].includes(this.$route.name) && this.$route.params?.id !== bookingEngineId;
      },
      isBookingEngineActive() {
        return ['channel'].includes(this.$route.name) && this.$route.params?.id === bookingEngineId;
      },
      isSystemsActive() {
        return ['systems'].includes(this.$route.name);
      },
      isMasterDataActive() {
        return ['masterdata'].includes(this.$route.name);
      },
      isContactPersonsActive() {
        return ['contactpersons'].includes(this.$route.name);
      },
      isFacilitiesActive() {
        return ['facilities'].includes(this.$route.name);
      },
      isNearbyActive() {
        return ['nearby'].includes(this.$route.name);
      },
      isBookingActive() {
        return ['booking'].includes(this.$route.name);
      },
      isDescriptionActive() {
        return ['description'].includes(this.$route.name);
      },
      isPropertyGroupsActive() {
        return ['admin-groups'].includes(this.$route.name);
      },
    },
    watch: {
      $route() {
        this.toggleMenu();
      },
    },
    created() {
      if (this.showFeedback) {
        this.initZammadFeedback();
      }
    },
    methods: {
      toggleMenu(name = null) {
        Object.keys(this.menu).forEach((k) => {
          this.menu[k] = k === name ? !this.menu[k] : false;
        });
      },
      initZammadFeedback() {
        let tries = 20;
        let interval;
        const checkZammad = () => {
          tries -= 1;
          if (!tries) {
            clearInterval(interval);
          }
          if (window.jQuery != null) {
            try {
              $('#feedback-form').ZammadForm({
                messageTitle: this.$t('feedbackForm.title'),
                messageSubmit: i18n.t('feedback-form.button'),
                messageThankYou: i18n.t('feedback-form.message'),
                debug: false,
                modal: true,
                showTitle: true,
                attachmentSupport: true,
              });
              clearInterval(interval);
            } catch (error) {
              console.warn('ZammadForm is absent'); // eslint-disable-line no-console
            }
          }
        };
        interval = setInterval(checkZammad, 100);
      },
      poupulatefeedbackForm() {
        setTimeout(() => {
          const feedbackForm = document.querySelector('.zammad-form');
          const feedbackFormFields = feedbackForm?.getElementsByTagName('input');
          const messageField = feedbackForm?.getElementsByTagName('textarea');
          const submitBtn = feedbackForm?.querySelector('.btn');
          if (feedbackForm) {
            feedbackFormFields[0].value = this.user?.profile?.name;
            feedbackFormFields[1].value = this.user?.email;
            submitBtn.disabled = true;
            const fields = [...feedbackFormFields, ...messageField];
            fields.forEach((field) => {
              field.addEventListener('input', () => {
                if (feedbackFormFields[0]?.value && feedbackFormFields[1]?.value && messageField[0]?.value) {
                  submitBtn.disabled = false;
                } else {
                  submitBtn.disabled = true;
                }
              });
            });
            feedbackForm.getElementsByTagName('h2')[0].remove();
            feedbackForm.insertAdjacentHTML('afterbegin',
                                            `<div class="d-flex justify-content-between align-content-center">
                <h2>${this.$t('feedbackForm.title')}</h2>
                <div class="my-auto" id="feedbackform-close">
                  <img src="/assets/images/close.svg"/>
                </div>
              </div>`);
            const feedbackFormCloseButton = feedbackForm.querySelector('#feedbackform-close');
            feedbackFormCloseButton.addEventListener('click', () => {
              document.querySelector('.zammad-form-modal-backdrop').click();
            });
          } else {
            this.initZammadFeedback();
          }
        }, 10);
      },
    },
  };
</script>
