import unittest

from backend.browser_agent import (
    _build_redbus_route_url,
    find_best_seat_candidate,
    generate_bus_selection_reason,
    normalize_seat_preference,
    parse_redbus_tuple_aria,
    score_bus_option,
    score_seat_candidate,
)
from backend.rag_engine import BookingPlan, build_booking_plan


class SeatPreferenceTests(unittest.TestCase):
    def test_normalize_seat_preference(self):
        self.assertEqual(normalize_seat_preference('front seat'), 'front')
        self.assertEqual(normalize_seat_preference('window seat'), 'window')
        self.assertEqual(normalize_seat_preference('middle seat'), 'center')
        self.assertEqual(normalize_seat_preference('back side'), 'back')
        self.assertEqual(normalize_seat_preference('aisle'), 'aisle')

    def test_score_seat_candidate_prefers_front_for_front_request(self):
        self.assertGreater(score_seat_candidate('L1', 'front'), score_seat_candidate('L8', 'front'))
        self.assertGreater(score_seat_candidate('U4', 'back'), score_seat_candidate('L1', 'back'))

    def test_score_seat_candidate_window_and_aisle(self):
        self.assertGreater(score_seat_candidate('Seat 5 Window', 'window'), score_seat_candidate('Seat 5 Aisle', 'window'))
        self.assertGreater(score_seat_candidate('Seat 5 Aisle', 'aisle'), score_seat_candidate('Seat 5 Window', 'aisle'))

    def test_score_seat_candidate_sleeper_vs_seater(self):
        self.assertGreater(
            score_seat_candidate('Seat 4, sleeper berth', 'any', bus_category='SLEEPER'),
            score_seat_candidate('Seat 4, seater', 'any', bus_category='SLEEPER'),
        )
        self.assertGreater(
            score_seat_candidate('Seat 4, seater', 'any', bus_category='SEATER'),
            score_seat_candidate('Seat 4, sleeper berth', 'any', bus_category='SEATER'),
        )

    def test_score_seat_candidate_female_berth_avoidance(self):
        self.assertLess(
            score_seat_candidate('Seat 3A, reserved for female', 'any', booking_for_women=False),
            score_seat_candidate('Seat 3A, standard', 'any', booking_for_women=False),
        )

    def test_route_extraction_uses_user_query_not_default_city(self):
        plan = build_booking_plan('AC Sleeper Hyderabad to Pune tomorrow, cheapest first, apply best offer')
        self.assertEqual(plan.source_city, 'Hyderabad')
        self.assertEqual(plan.destination_city, 'Pune')
        self.assertFalse(plan.needs_input)

    def test_missing_route_sets_needs_input(self):
        plan = build_booking_plan('Book an AC bus tomorrow morning')
        self.assertTrue(plan.needs_input)
        self.assertIn('source_city', plan.missing_fields)
        self.assertIn('destination_city', plan.missing_fields)

    def test_find_best_seat_candidate_prefers_available_front_window_seat(self):
        candidates = [
            {'text': 'L1 Window, available', 'selector': 'button[data-seat="L1"]'},
            {'text': 'L8 Window, available', 'selector': 'button[data-seat="L8"]'},
            {'text': 'Booked', 'selector': 'button[data-seat="L2"]'},
        ]
        chosen = find_best_seat_candidate(candidates, 'front')
        self.assertEqual(chosen['selector'], 'button[data-seat="L1"]')

    def test_build_redbus_route_url_dynamic_cities(self):
        plan = BookingPlan(
            source_city='Delhi',
            destination_city='Jaipur',
            travel_date='2026-11-20',
            ac_required=True,
            bus_category='SLEEPER',
            sort_by='CHEAPEST',
            agent_reply='Route planned',
        )
        url = _build_redbus_route_url(plan)
        self.assertIn('delhi-to-jaipur', url)
        self.assertIn('20-Nov-2026', url)

    def test_build_redbus_route_url_requires_cities(self):
        plan = BookingPlan(
            source_city='',
            destination_city='',
            travel_date='2026-11-20',
            ac_required=True,
            bus_category='SLEEPER',
            sort_by='CHEAPEST',
            agent_reply='Route planned',
        )
        with self.assertRaises(ValueError):
            _build_redbus_route_url(plan)

    def test_format_redbus_date_handles_relative_words(self):
        from backend.browser_agent import _format_redbus_date
        tomorrow_fmt = _format_redbus_date("tomorrow")
        self.assertRegex(tomorrow_fmt, r"^\d{2}-[A-Z][a-z]{2}-\d{4}$")
        self.assertNotIn("tomorrow", tomorrow_fmt.lower())

        iso_fmt = _format_redbus_date("2026-11-25")
        self.assertEqual(iso_fmt, "25-Nov-2026")

        dec_fmt = _format_redbus_date("December 1st")
        self.assertEqual(dec_fmt, "01-Dec-2026")

    def test_build_booking_plan_normalizes_relative_travel_date(self):
        plan = build_booking_plan("Chennai to Bangalore tomorrow")
        self.assertRegex(plan.travel_date, r"^\d{4}-\d{2}-\d{2}$")

        plan_dec = build_booking_plan("book tickets from chennai to coimbatore in night sleeper AC for December 1st")
        self.assertEqual(plan_dec.travel_date, "2026-12-01")
        self.assertEqual(plan_dec.source_city, "Chennai")
        self.assertEqual(plan_dec.destination_city, "Coimbatore")
        self.assertEqual(plan_dec.bus_category, "SLEEPER")

    def test_parse_redbus_tuple_aria(self):
        sample_aria = (
            "IntrCity SmartBus, Bharat Benz AC Sleeper (2+1), "
            "Departure at 22:30 from CMBT, Arrival at 05:45 at Majestic, Duration 7 hrs 15 mins, "
            "14 Seats available, Price INR 899, Rating 4.8 out of 5 stars based on 1250 reviews, "
            "Comfort score 4.9, Primo bus with Toilet and Live Tracking."
        )
        parsed = parse_redbus_tuple_aria(sample_aria)
        self.assertEqual(parsed["operator"], "IntrCity SmartBus")
        self.assertEqual(parsed["departure"], "22:30")
        self.assertEqual(parsed["arrival"], "05:45")
        self.assertEqual(parsed["price"], 899.0)
        self.assertEqual(parsed["rating"], 4.8)
        self.assertEqual(parsed["reviews_count"], 1250)
        self.assertIn("Toilet on-board", parsed["highlights"])
        self.assertIn("Live Tracking", parsed["highlights"])
        self.assertIn("Primo Certified", parsed["highlights"])

    def test_score_bus_option_ranking(self):
        high_rated_bus = {
            "operator": "IntrCity SmartBus",
            "rating": 4.8,
            "reviews_count": 1200,
            "comfort_score": 4.9,
            "price": 899,
            "departure": "22:30",
            "highlights": ["Toilet on-board", "Live Tracking"],
            "bus_type": "AC Sleeper",
        }
        low_rated_bus = {
            "operator": "Random Travels",
            "rating": 3.1,
            "reviews_count": 12,
            "comfort_score": 3.0,
            "price": 1200,
            "departure": "03:00",
            "highlights": [],
            "bus_type": "Non-AC",
        }
        score_high = score_bus_option(high_rated_bus, "BALANCED", "SLEEPER")
        score_low = score_bus_option(low_rated_bus, "BALANCED", "SLEEPER")
        self.assertGreater(score_high, score_low)

    def test_generate_bus_selection_reason(self):
        winner = {
            "operator": "IntrCity SmartBus",
            "rating": 4.8,
            "reviews_count": 1200,
            "comfort_score": 4.9,
            "price": 899,
            "score": 88.5,
            "departure": "22:30",
            "arrival": "05:45",
            "duration": "7h 15m",
            "highlights": ["Toilet on-board", "Live Tracking", "Primo Certified"],
            "bus_type": "AC Sleeper",
        }
        reason = generate_bus_selection_reason(winner, total_buses=24)
        self.assertIn("IntrCity SmartBus", reason)
        self.assertIn("4.8/5", reason)
        self.assertIn("24 available buses", reason)


if __name__ == '__main__':
    unittest.main()
